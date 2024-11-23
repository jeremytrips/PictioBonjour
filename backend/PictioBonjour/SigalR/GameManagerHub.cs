
using Microsoft.AspNetCore.SignalR;
using PictioBonjour.models;
using PictioBonjour.services;

namespace PictioBonjour.SigalR;

public class GameManagerHub : Hub
{
    const string StatusChanged = "onStatusChanged";
    const string PlayerListUpdated = "onplayerListUpdated";
    const string GameStopped = "onGameStopped";
    const string DrawEvent = "onDrawEvent";
    const string ResetGame = "onResetGame";

    private readonly GameManagerService _gameManagerService;

    public GameManagerHub(GameManagerService gameManagerService)
    {
        _gameManagerService = gameManagerService;

    }

    public async Task JoinGame()
    {
        var playerType = _gameManagerService.JoinGame(Context.ConnectionId);
        await Clients.Caller.SendAsync(StatusChanged, playerType);
        await Clients.All.SendAsync(PlayerListUpdated, _gameManagerService.AmountOfPlayers);
    }

    public async Task LeaveGame()
    {
        if(Context.ConnectionId == _gameManagerService.CurrentDrawer)
        {
            _gameManagerService.LeaveGame(Context.ConnectionId);
            await Clients.All.SendAsync(GameStopped);
            var userId = _gameManagerService.GetRandomAndAssignPlayer();
            if(userId is not null)
                await Clients.Client(userId).SendAsync(StatusChanged, EPlayerType.Drawer);
        }
        else{
            _gameManagerService.LeaveGame(Context.ConnectionId);
        }
        await Clients.All.SendAsync(PlayerListUpdated, _gameManagerService.AmountOfPlayers);
    }

    public void OnDrawEvent(byte[] canvas)
    {
        Clients.All.SendAsync(DrawEvent, canvas);
    }

    public void OnResetGame(){
        _gameManagerService.ResetGame();
        Clients.All.SendAsync(GameStopped);
    }
}
