using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PictioBonjour.routes
{
    [Route("api/")]
    [ApiController]
    public class BaseController : ControllerBase
    {
        [HttpGet("ping")]
        public IActionResult Get()
        {
            return Ok("ok");
        }
    }
}
