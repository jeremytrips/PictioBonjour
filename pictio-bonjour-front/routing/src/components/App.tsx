import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import "./App.css";
import PlayButton from "./PlayButton";

enum States {
  Lobby = "Lobby",
  Searching = "searching",
  Ready = "ready",
  Playing = "playing",
  Done = "done",
}

enum UserState {
  Drawer,
  Player
}

function App() {
  const [currentState, setCurrentState] = useState(States.Lobby);
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [playersNumber, setPlayersNumber] = useState(0)
  const [userState, SetUserState] = useState<UserState | null>(null);

  async function joinGame() {
    if (!connection) {
      return
    }

    setCurrentState(States.Searching)
    try {
      await connection.invoke("JoinGame");
    } catch (error) {
      console.error(error)
    }
  }

  onbeforeunload = (e: BeforeUnloadEvent) => {
    if (connection) {
      try {
        connection.invoke("LeaveGame");
      }
      catch (error) {
        console.error(error)
      }
      finally {
        connection.stop();
      }
    }
  }
  window.addEventListener('beforeunload', onbeforeunload);


  useEffect(() => {

    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5095/hub/game")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(connection)

    connection.start()
      .then(() => {
        console.log("connected")
      })
      .catch((error) => {
        console.error(error)
      });

    connection.on("onStatusChanged", (data) => {
      setCurrentState(States.Ready)
      SetUserState(data)
      console.log("status changed", data);
    });

    connection.on("onPlayerListUpdated", (data) => {
      console.log("playerListUpdated", data)
      setPlayersNumber(data)
    });

    connection.on("onGameStopped", () => {

    });

  }, [])



  function renderComponent(state: States) {

    switch (state) {
      case States.Lobby:
        return (
          <PlayButton onClick={joinGame} />
        );
      case States.Ready:
        return <div>Ready</div>
      case States.Searching:
        return <div>Searching...</div>;
      case States.Playing:
        return <div>There should be a canvas here</div>;
      case States.Done:
        return <div>Done</div>;
      default:
        return null;
    }
  };

  return <div className="container">
    <div>
      <h1>Players: {playersNumber}</h1>
      {userState !== null && <h2>{userState === UserState.Drawer ? "You are the drawer" : "You are a player"}</h2>}
    </div>
    {renderComponent(currentState)}
  </div>;
}

export default App;
