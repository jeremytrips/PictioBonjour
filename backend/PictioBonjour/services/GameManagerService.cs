using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{

    private Game? _game;

    public int AmountOfPlayers => _game?.Players.Count ?? 0;

    public EPlayerType JoinGame(string connectionId){
        if(_game is null){
            _game = new Game()
            {
                Id = Guid.NewGuid().ToString(),
                State = EGameSate.waiting,
                CurrentDrawer = connectionId,
            };
            return EPlayerType.Drawer;
        }
        _game.Players.Add(connectionId);
        return EPlayerType.Player;
    }

    public void JoinGame(string gameId, string userId)
    {
        if(_game is null){
            return;
        }
        _game.Players.Add(userId);
    }

    public void LeaveGame(string gameId, string userId)
    {
        if(_game is null){
            return;
        }
        _game.Players.Remove(userId);
    }

    public void LeaveGame(string connectionId)
    {
        if(_game is null){
            return;
        }
        _game.Players.Remove(connectionId);
    }
}
