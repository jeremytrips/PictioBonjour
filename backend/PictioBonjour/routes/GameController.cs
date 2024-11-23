using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PictioBonjour.services;

namespace PictioBonjour.routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly GameManagerService _gameManagerService;
        private  EmojieGeneratorService gameService=new EmojieGeneratorService(); 

        public GameController(GameManagerService gameManagerService)
        {
            _gameManagerService = gameManagerService;
        }

       
        [HttpGet("startGame")]
        public IActionResult StartGame()
        {
                 return Ok();
        }

        [HttpGet("create-game")]
        public ActionResult<string> StartGameToMerge()
        {
            var gameId = Guid.NewGuid().ToString();
            _gameManagerService.CreateGame(gameId);
            return Ok(gameId);
        }

        [HttpGet("joinGame/{gameId}/{userName}")]
        public IActionResult JoinGame(string gameId, string userName)
        {
            try
            {
                _gameManagerService.JoinGame(gameId, userName);
                return Ok();
            }
            catch (Exception e)
            {
                return NotFound("Game not found");
            }
        }
    }
}
