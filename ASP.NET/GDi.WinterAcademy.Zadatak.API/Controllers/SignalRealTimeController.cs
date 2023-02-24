using GDi.WinterAcademy.Zadatak.API.Models.Requests;
using GDi.WinterAcademy.Zadatak.API.Models.SignalR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using static GDi.WinterAcademy.Zadatak.API.Controllers.SensorCheckController;
using System.Text;
using GDi.WinterAcademy.Zadatak.Core.Entities;

namespace GDi.WinterAcademy.Zadatak.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SignalRealTimeController : ControllerBase
    {
        //this is a socket - communication between 2 apps which can't communicate with HTTP, this way enabling backend to alert frontend
        //(up until now we could only frontend -> backend with requests)

        private IHubContext<AppHub> _hub;
        private readonly HttpClient _client;


        public SignalRealTimeController(IHubContext<AppHub> hub, HttpClient client)
        {
            _client = client;
            _hub = hub;
        }

        [HttpPost("check")]
        public async Task<ActionResult> StartCheckingProcessForSensor([FromBody] long sensorId)
        {
            String processId = "ProcessSensorsCheck";

            var urlStartProcess = "http://localhost:8080/engine-rest/process-definition/key/" + processId + "/start";
            using StringContent jsonContent = new(
                System.Text.Json.JsonSerializer.Serialize(new
                {
                    variables = new { },
                    businessKey =  sensorId.ToString()
                }),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync(urlStartProcess, jsonContent);
            var responseString = await response.Content.ReadAsStringAsync();


            Root processInstance = System.Text.Json.JsonSerializer.Deserialize<Root>(responseString);
            var processInstanceId = processInstance.Id;

            return this.Ok(processInstanceId);
        }

        [HttpPost("notify")]
        public async Task<ActionResult> Notify([FromBody] NotifyRequest request)
        {
            await _hub.Clients.All.SendAsync("camundaMessageHub", request);
            return this.Ok("SENT");
        }

        [HttpGet]
        public async Task<ActionResult> CheckFunctionality()
        {
            bool isWorking = false;
            Random random = new Random();
            if (random.NextDouble() < 0.5)
                isWorking = true;

            using StringContent jsonContent = new(
                System.Text.Json.JsonSerializer.Serialize(new
                {
                    isWorking = isWorking,
                }),
                Encoding.UTF8,
                "application/json");

            return this.Ok(isWorking);
        }
    }
}
