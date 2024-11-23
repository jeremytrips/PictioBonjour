
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

    public void Send(string data)
    {
        Clients.All.SendAsync("send", data);
    }

    public void OnDrawEvent(string gameId, byte[] canvas)
    {
        Clients.Users(_gameManagerService.GetGame(gameId).Players).SendAsync("OnDrawEvent", canvas);
    }
}
    