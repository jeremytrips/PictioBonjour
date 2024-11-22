
using Microsoft.AspNetCore.SignalR;
using PictioBonjour.models;

namespace PictioBonjour.SigalR;

public class GameManager: Hub
{

    public GameManager()
    {

    }

    public async Task StartGame()
    {
        await Clients.All.SendAsync(EGameSate.running.ToString());
    }
}
    