import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import "./App.css";
import PlayButton from "./PlayButton";
import Painter from "./Painter";
import Paint from "./Paint";
import Guesser from "./Guesser";

enum States {
  Ready = "ready",
  Playing = "playing",
  Done = "done",
}

enum UserState {
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
  const [currentState, setCurrentState] = useState(States.Ready);
  const [playersNumber, setPlayersNumber] = useState(0)
  const [userState, SetUserState] = useState<UserState | null>(null);
  const [emojis, setEmojis] = useState("");
  const connectionRef = useRef<HubConnection | null>(null);

  window.onbeforeunload = function () {
    connectionRef.current?.invoke("LeaveGame")
      .then(() => console.log("left"))
  }

  useEffect(() => {
    console.log("mounting")
    connectionRef.current = new HubConnectionBuilder()
      .withUrl("http://localhost:5095/hub/game")
      .build();
    connectionRef.current.start()
      .then(() => {
        connectionRef.current!.invoke("JoinGame")
      });
      connectionRef.current.on("onStatusChanged", (state)=>{
        SetUserState(state)
      })
    return () => {
      connectionRef.current?.invoke("LeaveGame")
      console.log("unmounting")
    }
  }, [])

  const play = () => {
    connectionRef.current?.invoke("StartGame")
  }

  function renderComponent(state: States) {

    switch (state) {
      case States.Ready:
        return (
          <>
            {
              userState === 0 ? <PlayButton onClick={play} /> : ""
            }
          </>
        );
      case States.Playing:
        return <>
          {
            userState === 0 ? <Paint /> : <Guesser />
          }

        </>

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <p>{currentState}|{playersNumber}|{userState}</p>
      {renderComponent(currentState)}
    </div>
  );
}

export default App;
