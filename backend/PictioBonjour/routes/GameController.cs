using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PictioBonjour.routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        [HttpGet("startGame")]
        public IActionResult StartGame()
        {

            return Ok();
        }
    }
}
