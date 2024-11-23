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

export enum UserState {
  Drawer,
  Player
}


function App() {
  const [currentState, setCurrentState] = useState(States.Ready);
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [playersNumber, setPlayersNumber] = useState(0)
  const [userState, SetUserState] = useState<UserState | null>(null);
  const [target_emojis, setTargetEmoji] = useState("");
  const [potential_emojis, setPotentialEmoji] = useState<string[]>([]);
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
      connectionRef.current.on("onStatusChanged", (state)=>{
        SetUserState(state)
      })

      connectionRef.current.on("ReceivePotentialEmojis", (data)=>{
        setPotentialEmoji(data)
      })

      connectionRef.current.on("ReceiveTargetEmojis", (data)=>{
        setTargetEmoji(data)
        console.log(data);
        
      })
        

    connectionRef.current.on("onStatusChanged", (state) => {
      SetUserState(state)
    });
    if (userState !== UserState.Drawer) {
      connectionRef.current.on("onCanvasDrawed", (word) => {
        // setEmojis(word)
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
      case States.Ready:
        console.log("ready");
        return (
          <>
            {
              userState === 0 ? <PlayButton onClick={play} /> : ""
            }
          </>

        );
      case States.Playing:
        console.log("playing");
        
        return <>
          {
           
            <div className="container" style={{display: 'flex', flexDirection: 'row'}}>
        <div >
          <p>{JSON.stringify(userState)}</p>
          <p>{connectionRef.current?"connected":"not connected"}</p>
        </div>
        {
          connectionRef.current && userState!==null && <Paint connection={connectionRef.current!} userState={userState!} />
        }
        <p>{currentState}|{playersNumber}|{userState}</p>
      </div>
          }

        </>


      default:
        return null;
    }
  };


  return (
    <div className="container">
      {renderComponent(currentState)}
    </div>
  );

}

export default App;
