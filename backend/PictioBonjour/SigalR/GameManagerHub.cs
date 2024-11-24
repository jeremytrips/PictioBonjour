
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.SignalR;
using PictioBonjour.models;
using PictioBonjour.services;

namespace PictioBonjour.SigalR;

public class GameManagerHub : Hub
{
    const string StatusChanged = "onStatusChanged";
    const string PlayerListUpdated = "onplayerListUpdated";
    const string GameStopped = "onGameStopped";
    const string DrawEventResp = "onDrawEvent";
    const string ResetGame = "onResetGame";

    private readonly GameManagerService _gameManagerService;

    public GameManagerHub(GameManagerService gameManagerService)
    {
        _gameManagerService = gameManagerService;

    }
  
    public async Task<object> JoinGame()
    {
        var playerType = _gameManagerService.JoinGame(Context.ConnectionId);
        await Clients.Caller.SendAsync(StatusChanged, playerType);
        await Clients.All.SendAsync(PlayerListUpdated, _gameManagerService.AmountOfPlayers);
        Console.WriteLine("Player joined");
        Console.WriteLine(_gameManagerService.AmountOfPlayers + " players in game");
        return new{
            playerType,
            potentials=_gameManagerService.Game.Potentials,
            state = _gameManagerService.Game.State
        };
    }
    public async Task OnGameStarter()
    {
        _gameManagerService.Game.State = EGameSate.running;
        _gameManagerService.ResetGame(Context.ConnectionId);
        await Clients.Caller.SendAsync("ReceiveTargetEmojis", _gameManagerService.Game.Target); 
        await Clients.Others.SendAsync("ReceivePotentialEmojis", _gameManagerService.Game.Potentials);
    }

    public async Task LeaveGame()
    {
        if (Context.ConnectionId == _gameManagerService.CurrentDrawer)
        {
            _gameManagerService.LeaveGame(Context.ConnectionId);
            await Clients.All.SendAsync(GameStopped);
            var userId = _gameManagerService.GetRandomAndAssignPlayer();
            if (userId is not null)
                await Clients.Client(userId).SendAsync(StatusChanged, EPlayerType.Drawer);
            else{
                _gameManagerService.ResetGame();
            }
        }
        else
        {
            _gameManagerService.LeaveGame(Context.ConnectionId);
        }
        Console.WriteLine("Player left");
        Console.WriteLine(_gameManagerService.AmountOfPlayers + " players in game");
        await Clients.Others.SendAsync(PlayerListUpdated, _gameManagerService.AmountOfPlayers);
    }
        

    public void DrawEvent(string canvas)
    {
        Console.WriteLine(canvas.Length);
        Clients.Others.SendAsync(DrawEventResp, canvas);
    }
    public async Task<bool> SubmitEmoji(string PlayerEmojisChoice)
    {
        if(_gameManagerService.SubmitEmoji(PlayerEmojisChoice)){
            await Clients.Others.SendAsync("GameReset");
            _gameManagerService.ResetGame();
            return true;
        }else{
            return false;            
        }
    }
}
