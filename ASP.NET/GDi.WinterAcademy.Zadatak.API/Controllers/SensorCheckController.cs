using Camunda.Api.Client;
using Camunda.Api.Client.ProcessInstance;
using Camunda.Api.Client.ExternalTask;
using GDi.WinterAcademy.Zadatak.API.Models;
using GDi.WinterAcademy.Zadatak.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static GDi.WinterAcademy.Zadatak.API.Models.NotificationsDTO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using static System.Net.WebRequestMethods;
using System.Text.Json.Serialization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GDi.WinterAcademy.Zadatak.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorCheckController : ControllerBase
    {
        private readonly WinterAcademyZadatakDbContext _dbContext;
        private readonly HttpClient _client = new HttpClient();

        public SensorCheckController(WinterAcademyZadatakDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<SensorTypeModel>>> CheckSensors()
        {
            var sensors = await _dbContext.Sensors
                            .Include(s => s.Type).Include(s => s.Notifications)
                            .Select(s => new SensorModel
                            (
                                s.Id,
                                s.CurrentStatus,
                                s.TypeId,
                                s.Type.Description,
                                s.Type.LowestValueExpected,
                                s.Type.HighestValueExpected,
                                s.Notifications
                                  .Select(notificationList => new NotificationModel
                                  (
                                      notificationList.Id, notificationList.Status, notificationList.DateTimeReceived, notificationList.SensorId
                                  ))
                                  .ToList()
                            ))
                            .ToListAsync();

            return Ok(sensors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SensorModel>> CheckSensor(int id)
        {
            var sensor = _dbContext.Sensors.Include(s => s.Type).Include(s => s.Notifications).FirstOrDefault(s => s.Id == id);
            var notifications = sensor.Notifications.ToList();

            List<NotificationModel> notificationModels = new List<NotificationModel>();
            foreach (var notification in notifications)
            {
                notificationModels.Add
                (
                    new NotificationModel
                    (
                        notification.Id,
                        notification.Status,
                        notification.DateTimeReceived,
                        notification.SensorId
                    )
                ); ;
            }

            if (sensor == null)
            {
                return BadRequest($"The sensor with id {id} doesn't exist");
            }

            var selectedSensor = new SensorModel
            (
                sensor.Id,
                sensor.CurrentStatus,
                sensor.TypeId,
                sensor.Type.Description,
                sensor.Type.LowestValueExpected,
                sensor.Type.HighestValueExpected,
                notificationModels
            );

            return Ok(selectedSensor);
        }

        public class Link
        {
            [JsonPropertyName("method")]
            public string Method { get; set; }

            [JsonPropertyName("href")]
            public string Href { get; set; }

            [JsonPropertyName("rel")]
            public string Rel { get; set; }
        }

        public class Root
        {
            [JsonPropertyName("links")]
            public List<Link> Links { get; set; }

            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("definitionId")]
            public string DefinitionId { get; set; }

            [JsonPropertyName("businessKey")]
            public object BusinessKey { get; set; }

            [JsonPropertyName("caseInstanceId")]
            public object CaseInstanceId { get; set; }

            [JsonPropertyName("ended")]
            public bool? Ended { get; set; }

            [JsonPropertyName("suspended")]
            public bool? Suspended { get; set; }

            [JsonPropertyName("tenantId")]
            public object TenantId { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<List<SensorTypeModel>>> SetSensorsWorkingVariableBPMN([FromBody] bool isWorking)
        {

            CamundaClient camunda = CamundaClient.Create("http://localhost:8080/engine-rest");

            //pokrenut process odavde a ne izvana, i dohvatit tu id? zasada pokrenuto izvana i prekopiran id iz cockpita
            //var processInstanceId = "98549dfb-ad29-11ed-afe3-186024e50e2b";

            String baseUrl = "http://localhost:8080/engine-rest/external-task/";

            var urlStartProcess = "http://localhost:8080/engine-rest/process-definition/key/ProcessSensorsCheck/start";
            using StringContent jsonContent = new(
                System.Text.Json.JsonSerializer.Serialize(new
                {
                }),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync(urlStartProcess, jsonContent);
            var responseString = await response.Content.ReadAsStringAsync();


            Root processInstance = System.Text.Json.JsonSerializer.Deserialize<Root>(responseString);
            var processInstanceId = processInstance.Id;


            VariableResource vars = camunda.ProcessInstances[processInstanceId].Variables;

            // set variable
            await vars.Set("isWorking", VariableValue.FromObject(isWorking));

            // get all external tasks without specifying query
            List<ExternalTaskInfo> allTasks = await camunda.ExternalTasks.Query().List();
            var checkSensorStatusTask = allTasks.Find(externalTask => externalTask.ActivityId == "checkSensorStatus" && externalTask.ProcessInstanceId == processInstanceId);
            var checkSensorStatusTaskId = checkSensorStatusTask.Id;


            //first lock
            String urlLock = baseUrl + checkSensorStatusTaskId + "/lock";

            using StringContent jsonContent1 = new(
                System.Text.Json.JsonSerializer.Serialize(new
                {
                    workerId = "aWorker",
                    lockDuration = 100000 
                }),
                Encoding.UTF8,
                "application/json");

            var response1 = await _client.PostAsync(urlLock, jsonContent1);
            var responseString1 = await response1.Content.ReadAsStringAsync();

            //complete 1st external task (checking sensor status)
            String urlComplete = baseUrl + checkSensorStatusTaskId + "/complete";

            using StringContent jsonContent2 = new (
                System.Text.Json.JsonSerializer.Serialize(new
                {
                    workerId = "aWorker"
                }),
                Encoding.UTF8,
                "application/json");

            var response2 = await _client.PostAsync(urlComplete, jsonContent2);
            var responseString2 = await response2.Content.ReadAsStringAsync();

            var res = new
            {
                processId = processInstanceId,
                responsestring2 = responseString2
            };

            //if false, http post notify?

            return Ok(res);
        }


    }
}
