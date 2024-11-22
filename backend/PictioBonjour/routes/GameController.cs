using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PictioBonjour.routes
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        [HttpGet("startGame")]
        public IActionResult StartGame()
        {

            return Ok();
        }
    }
}
