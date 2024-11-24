using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PictioBonjour.routes
{
    [Route("/")]
    [ApiController]
    public class BaseController : ControllerBase
    {
        [HttpGet("/")]
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/html");
        }
        [HttpGet("ping")]
        public IActionResult Get()
        {
            return Ok("ok");
        }        
    }
}
