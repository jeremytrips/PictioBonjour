using System;
using System.Collections.Concurrent;
using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{
    private readonly ConcurrentDictionary<string, Game> _games = new();

    public IEnumerable<string> GetGames(){
        var gameIds = _games.Values.Select(i=>i.Id); 
        return gameIds;
    }
    public string CreateGame(string userId){
        var gameId = Guid.NewGuid().ToString();
        var game = new Game(){
            Id = gameId,
            State = EGameSate.waiting,
            CurrentDrawer = userId,
        };
        _games.TryAdd(gameId, game);
        return game.Id;
    }

    public Game GetGame(string gameId)
    {
        if (!_games.TryGetValue(gameId, out Game? game))
            throw new Exception("Game id not found");
        return game;
    }

    public void JoinGame(string gameId, string userId)
    {
        var gameState = GetGame(gameId);
        if (gameState.State != EGameSate.waiting)
            throw new Exception("Game is not in waiting state");
        gameState.Players.Add(userId);
    }

    public void LeaveGame(string gameId, string userId)
    {
        var gameState = GetGame(gameId);
        if (gameState.State != EGameSate.waiting)
            throw new Exception("Game is not in waiting state");
        gameState.Players.Remove(userId);
    }
}
