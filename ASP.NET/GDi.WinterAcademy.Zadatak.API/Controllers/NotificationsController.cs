using GDi.WinterAcademy.Zadatak.API.Models;
using GDi.WinterAcademy.Zadatak.Core.Entities;
using GDi.WinterAcademy.Zadatak.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using static GDi.WinterAcademy.Zadatak.API.Models.NotificationsDTO;

namespace GDi.WinterAcademy.Zadatak.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly WinterAcademyZadatakDbContext _dbContext;

        public NotificationsController(WinterAcademyZadatakDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationModel>>> GetNotifications()
        {
            var notifications = await _dbContext.Notifications
                            .Select(n => new NotificationModel
                            (
                                n.Id,
                                n.Status,
                                n.DateTimeReceived,
                                n.SensorId
                            ))
                            .ToListAsync();

            return Ok(notifications);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationModel>> GetNotification(int id)
        {
            var notification = _dbContext.Notifications.FirstOrDefault(n => n.Id == id);

            if (notification == null)
            {
                return BadRequest($"The notification with id {id} doesn't exist");
            }

            var selectedNotification = new NotificationModel
            (
                notification.Id,
                notification.Status,
                notification.DateTimeReceived,
                notification.SensorId
            );

            return Ok(selectedNotification);
        }

        [HttpPost]
        public async Task<ActionResult<NotificationModel>> AddNotification([FromBody] NotificationModel notificationModel)
        {
            var notification = new Notification
            {
                Status = notificationModel.Status, 
                DateTimeReceived = notificationModel.DateTimeReceived, 
                SensorId = notificationModel.SensorId
            };

            _dbContext.Notifications.Add(notification);

            //in order to avoid more than one request towards backend per sensor
            //and to ensure consistency between sensor current state and notification added for that sensor,
            //IF notification is added without the sensor being updated, update sensor here
            //(on frontend, sensor update itself will add a notification)
            //doesn't work - 500 Internal server error, so have to leave Test API method without sensors updating
            /*var sensor = _dbContext.Sensors.FirstOrDefault(s => s.Id == notificationModel.SensorId);
            if (sensor == null || sensor.CurrentStatus != notificationModel.Status)
            {
                var sensorsController = new SensorsController(_dbContext);
                var sensorModel = new SensorModel
                (
                    notificationModel.SensorId,
                    notificationModel.Status,
                    null,
                    null,
                    null,
                    null,
                    null
                );
                sensorsController.UpdateSensor(notificationModel.SensorId, sensorModel);
            }*/
       
            await _dbContext.SaveChangesAsync();

            return Ok(new NotificationModel
            (
                notification.Id,
                notification.Status,
                notification.DateTimeReceived,
                notification.SensorId
            ));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NotificationModel>> UpdateNotification(long id, [FromBody] NotificationModel notificationModel)
        {
            var notification = _dbContext.Notifications.FirstOrDefault(n => n.Id == id);
            if (notification is null)
                return BadRequest("Notification doesn't exist");

            notification.Status = notificationModel.Status;
            notification.DateTimeReceived = notificationModel.DateTimeReceived;
            notification.SensorId = notificationModel.SensorId;

            _dbContext.Entry(notification).State = EntityState.Modified;

            await _dbContext.SaveChangesAsync();

            return Ok(notificationModel);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<NotificationModel>> DeleteNotification(long id)
        {
            var notification = _dbContext.Notifications.FirstOrDefault(n => n.Id == id);
            if (notification is null)
                return BadRequest("Notification doesn't exist");

            _dbContext.Notifications.Remove(notification);
            _dbContext.Entry(notification).State = EntityState.Deleted;

            await _dbContext.SaveChangesAsync();

            return Ok(notification);
        }

        [HttpDelete]
        public async Task<ActionResult<NotificationModel>> DeleteNotifications()
        {
            var notificationsToDelete = _dbContext.Notifications.Select(n => new Notification { Id = n.Id }).ToList();
            _dbContext.Notifications.RemoveRange(notificationsToDelete);

            await _dbContext.SaveChangesAsync();

            return Ok(notificationsToDelete);
        }
    }
}
