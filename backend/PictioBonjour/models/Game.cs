using System;

namespace PictioBonjour.models;

public class Game
{
    public required string Id { get; set; }
    public EGameSate State { get; set; }
    public required string CurrentDrawer { get; set; }
    public DateTime StartTime { get; set; }
    public List<string> Players { get; set; } = [];
    public string Target { get; set; } = "Todo";
    public List<string> Potentials  { get; set; } = ["Todo1", "Todo2", "Todo3"];
}
