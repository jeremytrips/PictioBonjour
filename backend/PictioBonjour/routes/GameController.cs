using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PictioBonjour.services;

namespace PictioBonjour.routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {

        public GameController()
        {
        }

        [HttpGet("startGame")]
        public IActionResult StartGame()
        {
            return Ok();

        }
    }
}
