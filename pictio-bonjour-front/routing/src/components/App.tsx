import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
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
  const [playerCount, setPlayerCount] = useState(0);
  const connectionRef = useRef<HubConnection | null>(null);
  const hexCode = target_emojis.split("U+")[1];
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getRandomPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const x = Math.random() * viewportWidth;
    const y = Math.random() * viewportHeight;

    return { x, y };
  };

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    if (starRefs.current.length !== playerCount) {
      starRefs.current = starRefs.current.slice(0, playerCount);
      for (let i = starRefs.current.length; i < playerCount; i++) {
        starRefs.current.push(null);
      }
    }

    // Initialisation des cercles
    starRefs.current.forEach((ref, index) => {
      if (ref) {
        const { x, y } = getRandomPosition();
        ref.style.position = "absolute";
        ref.style.left = `${x}px`;
        ref.style.top = `${y}px`;
        ref.style.backgroundColor = getRandomColor();

        // Ajouter un gestionnaire pour changer la position à chaque cycle
        ref.addEventListener("animationiteration", () => {
          const newPos = getRandomPosition();
          ref.style.left = `${newPos.x}px`;
          ref.style.top = `${newPos.y}px`;
          ref.style.backgroundColor = getRandomColor();
        });
      }
    });
  }, [playerCount]);

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

    connectionRef.current.on("ReceivePotentialEmojis", (data) => {
      setPotentialEmoji(data);
      setCurrentState(States.Playing);
    });

    connectionRef.current.on("ReceiveTargetEmojis", (data) => {
      setTargetEmoji(data);
      setCurrentState(States.Playing);
    });

    connectionRef.current.on("onplayerListUpdated", (data) => {
      setPlayerCount(data);
    });

    return () => {
      connectionRef.current?.invoke("LeaveGame");
      console.log("unmounting");
    };
  }, []);

  const play = () => {
    connectionRef.current?.invoke("OnGameStarter");
  };

  function renderComponent(state: States) {
    switch (state) {
      case States.Ready:
        return (
          <>
            <p className="title">less is more</p>
            <div>
              {userState === 0 ? <PlayButton onClick={play} /> : ""}
            </div>
            <div className="user-animations">
              {Array.from({ length: playerCount }).map((_, index) => (
                <div
                  key={index}
                  className="user-animation"
                  ref={(el) => (starRefs.current[index] = el)}
                />
              ))}
            </div>
          </>
        );
      case States.Playing:
        return (
          <>
            <div className="container" style={{ display: "flex", flexDirection: "row" }}>
              <Paint connection={connectionRef.current!} userState={userState!} />
            </div>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="container emoji">
      <p>{playerCount} player(s)</p>
      {userState === UserState.Drawer && (
        <>
          {hexCode && (
            <div className="emoji-container">
              <div className="emo">
                {String.fromCodePoint(parseInt(hexCode, 16))}
              </div>
            </div>
          )}
        </>
      )}
      {userState === UserState.Player && potential_emojis && (
        <div className="container emoji-container">
          {potential_emojis.map((emoji, index) => (
            <div className="emo" key={index}>
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
