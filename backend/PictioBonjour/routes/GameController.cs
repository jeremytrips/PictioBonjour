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
        private EmojieGeneratorService gameService = new EmojieGeneratorService();

        public GameController(GameManagerService gameManagerService)
        {
            _gameManagerService = gameManagerService;
        }


        [HttpGet("startGame")]
        public IActionResult StartGame()
        {
            return Ok();

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
        [HttpPost("submit-emojie")]
        public IActionResult SubmitEmoji([FromBody] string choice)
        {
            if (choice == null || string.IsNullOrWhiteSpace(choice))
            {
                return BadRequest("Invalid emoji choice.");
            }
            string unicodeWithPrefix = GetUnicodeWithPrefix(choice);
            bool isCorrect = unicodeWithPrefix == gameService.randomTargetEmojie;
            _gameManagerService.ResetGame();
            return Ok(new { isCorrect });
        }

        private string GetUnicodeWithPrefix(string emoji)
        {
            int codePoint = emoji[0];
            return $"U+{codePoint:X4}";
        }
    }
}
