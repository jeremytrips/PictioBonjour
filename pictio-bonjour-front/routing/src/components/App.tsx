import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import "./App.css";
import PlayButton from "./PlayButton";
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

function App() {
  const [currentState, setCurrentState] = useState(States.Ready);
  const [playersNumber, setPlayersNumber] = useState(0)
  const [userState, SetUserState] = useState<UserState | null>(null);
  const [emojis,setEmojis] = useState("")


  async function play() {
    if (!connection) {
      return
    }
    setCurrentState(States.Playing)
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
    connection.on("onStatusChanged", (data) => {
      SetUserState(data)
      console.log("status changed", data);
    });

    connection.on("onPlayerListUpdated", (data) => {
      setPlayersNumber(data)
    });



    connection.on("onGameStopped", () => {
    });
  }, [])



  function renderComponent(state: States) {

    switch (state) {
      case States.Ready:
        return (
          <> 
          {
            userState === 0 ? <PlayButton onClick={play}/>: ""
          }
          </>
        );
      case States.Playing:
        return <>
          {
             userState === 0 ? <Paint/> : <Guesser/>
          }
          
        </>

      default:
        return null;
    }
  };

  return <div className="container">
    {renderComponent(currentState)}
  </div>;
}

export default App;
