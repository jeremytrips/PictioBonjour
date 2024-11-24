using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{

    private Game? _game;
    public Game Game => _game ?? throw new Exception("No game is running");
    public EmojieGeneratorService EmojieGenerator { get; set; }
    private Random _randomizer = new Random();
    public string? CurrentDrawer => _game?.CurrentDrawer;
    public readonly List<string> Players = [];

    public GameManagerService(EmojieGeneratorService emojieGenerator)
    {
        EmojieGenerator = emojieGenerator;
    }


    public EPlayerType JoinGame(string connectionId)
    {
        if (_game is null)
        {
            var potentials = EmojieGenerator.GeneratePotentialEmoji();
            _game = new Game()
            {
                Id = Guid.NewGuid().ToString(),
                State = EGameSate.waiting,
                CurrentDrawer = connectionId,
                Potentials = potentials,
                Target = potentials[new Random().Next(0, potentials.Count)]
            };
            return EPlayerType.Drawer;
        }
        return EPlayerType.Player;
    }

    public void ResetGame(string connectionId)
    {
        var potentials = EmojieGenerator.GeneratePotentialEmoji();
        if (_game != null)
        {
            _game.Target = potentials.ElementAt(_randomizer.Next(0, potentials.Count));
            _game.Potentials = potentials;
            _game.CurrentDrawer = connectionId;
            _game.State = EGameSate.running;
        }
    }

    public void ResetGame()
    {
        _game = null;
    }

    internal bool SubmitEmoji(string playerEmojisChoice)
    {
        return playerEmojisChoice == _game?.Target;
    }

    internal void NewGame(string connectionId)
    {
        var potentials = EmojieGenerator.GeneratePotentialEmoji();
        _game = new Game()
        {
            Id = Guid.NewGuid().ToString(),
            State = EGameSate.running,
            CurrentDrawer = connectionId,
            Potentials = potentials,
            Target = potentials.ElementAt(_randomizer.Next(0, potentials.Count))
        };
    }
}

