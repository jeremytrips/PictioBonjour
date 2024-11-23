using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{

    private Game? _game;   
    
    public  EmojieGeneratorService EmojieGenerator { get; set; }
    public GameManagerService(EmojieGeneratorService emojieGenerator)
    {
        EmojieGenerator = emojieGenerator ?? throw new ArgumentNullException(nameof(emojieGenerator));
    }
  
    
    public int AmountOfPlayers => _game?.Players.Count ?? 0;
    public string? CurrentDrawer => _game?.CurrentDrawer;

    public EPlayerType JoinGame(string connectionId)
    {
        if (_game is null)
        {
            _game = new Game()
            {
                Id = Guid.NewGuid().ToString(),
                State = EGameSate.waiting,
                CurrentDrawer = connectionId,
                Players = [connectionId]
            };
            return EPlayerType.Drawer;
        }

        if (!_game.Players.Contains(connectionId))
        {
            _game.Players.Add(connectionId);
        }
        return EPlayerType.Player;
    }

    public string? GetRandomAndAssignPlayer()
    {
        if (_game is null)
        {
            throw new Exception("No game is running");
        }
        else
        {
            if(_game.Players.Count == 0){
                ResetGame();
                return null;
            }
                
            var random = new Random();
            var randomIndex = random.Next(0, _game.Players.Count);
            var newDrawer = _game.Players[randomIndex];
            _game.CurrentDrawer = newDrawer;
            Console.WriteLine($"Assigning new drawer: {newDrawer}");
            return newDrawer;
        }
    }

    public void JoinGame(string gameId, string userId)
    {
        if (_game is null)
        {
            return;
        }
        _game.Players.Add(userId);
    }

    public void LeaveGame(string gameId, string userId)
    {
        if (_game is null)
        {
            return;
        }
        _game.Players.Remove(userId);
    }

    public void LeaveGame(string connectionId)
    {
        var a = new List<int>(){1,2,3};
        if (_game is null)
        {
            return;
        }
        if(!_game.Players.Remove(connectionId))
            throw new Exception("Player not found");
    }

    public void ResetGame()
    {
        _game = null;
    }

    
}

