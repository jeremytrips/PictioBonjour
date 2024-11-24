using System;
using System.Runtime.CompilerServices;

namespace PictioBonjour.models;

public class Game
{
    public required string Id { get; set; }
    public EGameSate State { get; set; }
    public required string CurrentDrawer { get; set; }
    public DateTime StartTime { get; set; }
    public List<string> Players { get; set; } = [];
    public required string Target { get; set; }
    public required List<string> Potentials  { get; set; }

    public Game Copy(string currentDrawer, string target, List<string> potentials)
    {
        return new Game()
        {
            Id = Guid.NewGuid().ToString(),
            State = EGameSate.waiting,
            CurrentDrawer = currentDrawer,
            Players = Players,
            Potentials = potentials,
            Target = target
        };
    }
}
