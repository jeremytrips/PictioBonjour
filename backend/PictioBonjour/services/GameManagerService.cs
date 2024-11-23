using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{

    private Game? _game;

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
        if (_game.Players.Count == 0)
        {
            _game = null;
            return null;
        }
        else
        {
            var random = new Random();
            var randomIndex = random.Next(0, _game.Players.Count);
            var newDrawer = _game.Players[randomIndex];
            _game.CurrentDrawer = newDrawer;
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
        if (_game is null)
        {
            return;
        }
        _game.Players.Remove(connectionId);
    }

    public void ResetGame()
    {
        _game = null;
    }
}
