
using Microsoft.AspNetCore.SignalR;
using PictioBonjour.models;
using PictioBonjour.services;

namespace PictioBonjour.SigalR;

public class GameManagerHub: Hub
{
    private readonly GameManagerService _gameManagerService;
    private Game? _game;

    public GameManagerHub(GameManagerService gameManagerService)
    {
        _gameManagerService = gameManagerService;
        _game = new Game(){
            Id = Guid.NewGuid().ToString(),
            State = EGameSate.waiting,
            CurrentDrawer = Context.ConnectionId,
        };
    }

    public async Task JoinGame()
    {
        if (_game is null)
        {
            _game = new Game()
            {
                Id = Guid.NewGuid().ToString(),
                State = EGameSate.waiting,
                CurrentDrawer = Context.ConnectionId,
            };
            await Clients.Caller.SendAsync("onStatusChanged", EPlayerType.Drawer);
        }else
        {
            await Clients.Caller.SendAsync("onStatusChanged", EPlayerType.Player);
        }
        await Clients.All.SendAsync("playerListUpdated", _game.Players.Count + 1);
    }


    public void OnDrawEvent(byte[] canvas)
    {
        Clients.All.SendAsync("OnDrawEvent", canvas);
    }
}
    