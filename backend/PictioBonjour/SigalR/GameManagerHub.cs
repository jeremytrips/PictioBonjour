
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
  
    public async Task JoinGame()
    {
        var playerType = _gameManagerService.JoinGame(Context.ConnectionId);
        await Clients.Caller.SendAsync(StatusChanged, playerType);
        await Clients.All.SendAsync(PlayerListUpdated, _gameManagerService.AmountOfPlayers);
        Console.WriteLine("Player joined");
        Console.WriteLine(_gameManagerService.AmountOfPlayers + " players in game");
    }
    public async Task OnGameStarter()
    {
        if (_gameManagerService.EmojieGenerator == null)
        {
            throw new InvalidOperationException("EmojiGeneratorService is not initialized.");
        }
       
        if (_gameManagerService.CurrentDrawer != Context.ConnectionId)
        {
            throw new InvalidOperationException("Not the drawer");
        }

// G�n�rer les emojis
        var targetEmojis = _gameManagerService.EmojieGenerator.GenerateTargetEmoji();
        var potentialEmojis = _gameManagerService.EmojieGenerator.GeneratePotentialEmoji();

        // Envoyer les emojis aux joueurs
        await Clients.Caller.SendAsync("ReceiveTargetEmojis", targetEmojis); // Drawer re�oit les cibles
        await Clients.Others.SendAsync("ReceivePotentialEmojis", potentialEmojis);
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

    public void OnResetGame(){
        _gameManagerService.ResetGame();
        Clients.All.SendAsync(GameStopped);
    }
}
