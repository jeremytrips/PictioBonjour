import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
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



const connection = new HubConnectionBuilder()
.withUrl("http://localhost:5095/hub/game")
.withAutomaticReconnect()
.configureLogging(LogLevel.Information)
.build();


async function joinGame() {
  if (!connection) {
    return
  }
  try {
    await connection.invoke("JoinGame");
    console.log("joined");
    
  } catch (error) {
    console.error(error)
  }
}

async function startGame() {
  if (!connection) {
    return
  }
}


connection.start()
.then(() => {
  joinGame()
})
.catch((error) => {
  console.error(error)
});

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
