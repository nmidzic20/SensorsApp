using GDi.WinterAcademy.Zadatak.API.Models;
using GDi.WinterAcademy.Zadatak.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static GDi.WinterAcademy.Zadatak.API.Models.NotificationsDTO;

namespace GDi.WinterAcademy.Zadatak.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly WinterAcademyZadatakDbContext _dbContext;

        public UsersController(WinterAcademyZadatakDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<UserModel>> GetUser(string username)
        {
            var user = new UserModel(0, username, "ij");

            return Ok(user);
        }
    }
}
