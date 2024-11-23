import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import "./App.css";
import PlayButton from "./PlayButton";
import Paint from "./Paint";

enum States {
  Ready = "ready",
  Playing = "playing",
  Done = "done",
}

export enum UserState {
  Drawer,
  Player,
}

function App() {
  const [currentState, setCurrentState] = useState(States.Ready);
  const [userState, SetUserState] = useState<UserState | null>(null);
  const [target_emojis, setTargetEmoji] = useState("");
  const [potential_emojis, setPotentialEmoji] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const hexCode = target_emojis.split("U+")[1]; // Extraire la partie hexadécimale du code

  window.onbeforeunload = function () {
    connectionRef.current?.invoke("LeaveGame").then(() => console.log("left"));
  };

  useEffect(() => {
    connectionRef.current = new HubConnectionBuilder()
      .withUrl("http://localhost:5095/hub/game")
      .build();

    connectionRef.current.start().then(() => {
      connectionRef.current!.invoke("JoinGame");
    });
    connectionRef.current.on("onStatusChanged", (state) => {
      SetUserState(state);
    });

    connectionRef.current.on("ReceivePotentialEmojis", (data)=>{
      setPotentialEmoji(data)
      setCurrentState(States.Playing)
    })

    connectionRef.current.on("ReceiveTargetEmojis", (data)=>{
      setTargetEmoji(data)
      setCurrentState(States.Playing)
    })

    connectionRef.current.on("onStatusChanged", (state) => {
      SetUserState(state);
    });

    return () => {
      connectionRef.current?.invoke("LeaveGame");
      console.log("unmounting");
    };
  }, []);

  const play = () => {
    connectionRef.current?.invoke("OnGameStarter")
  }

  function renderComponent(state: States) {
    switch (state) {
      case States.Ready:
        return (
          <>
            <p className="title">less is more</p>
            <div style={{}}>
              {userState === 0 ? <PlayButton onClick={play} /> : ""}
            </div>
          </>
        );
      case States.Playing:
        return <>
          {
            <div className="container" style={{display: 'flex', flexDirection: 'row'}}>

              <Paint connection={connectionRef.current!} userState={userState!} />
            </div>
          }
        </>
      default:
        return null;
    }
  }

  return (
    <div
      className="container emoji"
      
    >
      {userState === UserState.Drawer && (
        <>
          {hexCode && (
            <div style={{ fontSize: "5em" }}>
              {String.fromCodePoint(parseInt(hexCode, 16))}
            </div>
          )}
        </>
      )}
      {/* Si l'utilisateur est un Guesser, affiche les emojis potentiels */}
      {userState === UserState.Player && potential_emojis && (
        <div
        
        className="emoji-container"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "nowrap",
            justifyContent: "center",
          }}
        >
          {potential_emojis.map((emoji, index) => (
            <div  key={index} style={{ fontSize: "2em", margin: "0" }}>
              {String.fromCodePoint(parseInt(emoji.split("U+")[1], 16))}
            </div>
          ))}
        </div>
      )}

      {renderComponent(currentState)}
    </div>
  );
}

export default App;
