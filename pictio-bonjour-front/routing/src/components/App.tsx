import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import "./App.css";
import PlayButton from "./PlayButton";
import Painter from "./Painter";
import Paint from "./Paint";
import Guesser from "./Guesser";

enum States {
  Lobby = "Lobby",
  Searching = "searching",
  Ready = "ready",
  Playing = "playing",
  Done = "done",
}

export enum UserState {
  Drawer,
  Player
}




async function joinGame(connection: HubConnection) {
  if (!connection) {
    return
  }
  try {
    await connection.invoke("JoinGame");
  } catch (error) {
    console.error(error)
  }
}

async function startGame(connection: HubConnection) {
  if (!connection) {
    return
  }
}


function App() {
  const [currentState, setCurrentState] = useState(States.Lobby);
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [playersNumber, setPlayersNumber] = useState(0)
  const [userState, SetUserState] = useState<UserState | null>(null);
  const [emojis, setEmojis] = useState("");
  const connectionRef = useRef<HubConnection | null>(null);

  window.onbeforeunload = function () {
    connectionRef.current?.invoke("LeaveGame")
      .then(() => console.log("left"))
  }

  useEffect(() => {
    connectionRef.current = new HubConnectionBuilder()
      .withUrl("http://localhost:5095/hub/game")
      .build();

    connectionRef.current.start()
      .then(() => {
        connectionRef.current!.invoke("JoinGame")
      });

    connectionRef.current.on("onStatusChanged", (state) => {
      SetUserState(state)
    });
    if (userState !== UserState.Drawer) {
      connectionRef.current.on("onCanvasDrawed", (word) => {
        setEmojis(word)
      });
    }

    return () => {
      connectionRef.current?.invoke("LeaveGame")
      console.log("unmounting")
    }

  }, [])

  const play = () => {
    connectionRef.current?.invoke("OnGameStarter")
  }

  function renderComponent(state: States) {

    switch (state) {
      case States.Lobby:
        return (

          <>
            {
              userState === 0 ? <PlayButton onClick={play} /> : ""
            }
          </>

        );
      case States.Ready:
        return <div>Ready</div>
      case States.Searching:
        return <div>Searching...</div>;
      case States.Playing:

        return <>
          {
            <Paint connection={connectionRef.current!} userState={userState!} />
          }

        </>


      default:
        return null;
    }
  };


  return (
    <div className="container" style={{display: 'flex', flexDirection: 'row'}}>
      <div >
        <p>{JSON.stringify(userState)}</p>
        <p>{connectionRef.current?"connected":"not connected"}</p>
      </div>
      {
        connectionRef.current && userState!==null && <Paint connection={connectionRef.current!} userState={userState!} />
      }
      <p>{currentState}|{playersNumber}|{userState}</p>
      {/* {renderComponent(currentState)} */}
    </div>
  );

}

export default App;
