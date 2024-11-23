
using Microsoft.AspNetCore.SignalR;
using PictioBonjour.models;
using PictioBonjour.services;

namespace PictioBonjour.SigalR;

public class GameManagerHub: Hub
{
    private readonly GameManagerService _gameManagerService;

    public GameManagerHub(GameManagerService gameManagerService)
    {
        _gameManagerService = gameManagerService;

    }

    public async Task JoinGame()
    {
        var playerType = _gameManagerService.JoinGame(Context.ConnectionId);
        await Clients.Caller.SendAsync("onStatusChanged", playerType);
        await Clients.All.SendAsync("playerListUpdated", _gameManagerService.AmountOfPlayers + 1);
    }

    public async Task OnLeaveGame()
    {
        _gameManagerService.LeaveGame(Context.ConnectionId);
        await Clients.All.SendAsync("playerListUpdated", _gameManagerService.AmountOfPlayers);
    }

    public void OnDrawEvent(byte[] canvas)
    {
        Clients.All.SendAsync("OnDrawEvent", canvas);
    }
}
    