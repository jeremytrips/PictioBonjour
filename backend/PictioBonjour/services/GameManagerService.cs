using PictioBonjour.models;

namespace PictioBonjour.services;

public class GameManagerService
{

    private Game? _game;
    public Game Game => _game ?? throw new Exception("No game is running");
    public EmojieGeneratorService EmojieGenerator { get; set; }
    private Random _randomizer = new Random();

    public int AmountOfPlayers => _game?.Players.Count ?? 0;
    public string? CurrentDrawer => _game?.CurrentDrawer;

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
                Players = [connectionId],
                Potentials = potentials,
                Target = potentials[new Random().Next(0, potentials.Count)]
            };
            return EPlayerType.Drawer;
        }

        if (!_game.Players.Contains(connectionId))
        {
            _game.Players.Add(connectionId);
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

    public string? GetRandomAndAssignPlayer()
    {
        if (_game is null)
        {
            throw new Exception("No game is running");
        }
        else
        {
            if (_game.Players.Count == 0)
            {
                ResetGame();
                return null;
            }

            var random = new Random();
            var randomIndex = random.Next(0, _game.Players.Count);
            var newDrawer = _game.Players[randomIndex];
            _game.CurrentDrawer = newDrawer;
            Console.WriteLine($"Assigning new drawer: {newDrawer}");
            return newDrawer;
        }
    }

    public void JoinGame(string gameId, string userId)
    {
        if (_game is null)
        {
            return;
        }
        _game.Players.Add(userId);
    }

    public void LeaveGame(string connectionId)
    {
        if (_game is null)
        {
            return;
        }
        if (!_game.Players.Remove(connectionId))
            throw new Exception("Player not found");
    }

    public void ResetGame()
    {
        _game = null;
    }

    internal bool SubmitEmoji(string playerEmojisChoice)
    {
        return playerEmojisChoice == _game?.Target;
    }
}

