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

enum EGameState
{
    waiting,
    running, 
    done,
}


export enum EPlayerType {
  Drawer,
  Player,
}

function App() {
  const [canSubmit, setCanSubmit] = useState(true);
  const [currentState, setCurrentState] = useState(States.Ready);
  const [userType, setUserType] = useState<EPlayerType | null>(null);
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

    connectionRef.current.start().then(async () => {
      const res = await connectionRef.current!.invoke<{
        playerType: EPlayerType;
        potentials: string[];
        state: EGameState;
    }>("JoinGame");
      setUserType(res.playerType);
      if(res.state === EGameState.running)
      {
        setPotentialEmoji(res.potentials);
        setCurrentState(States.Playing);
      }
    });

    connectionRef.current.on("onStatusChanged", (state) => {
      setUserType(state);
    });

    connectionRef.current.on("ReceivePotentialEmojis", (data) => {
      setPotentialEmoji(data);
      setCurrentState(States.Playing);
    });

    connectionRef.current.on("ReceiveTargetEmojis", (data) => {
      setTargetEmoji(data)
      setCurrentState(States.Playing)
    })

    connectionRef.current.on("GameReset", () => {
      console.log("Recieved a game reset evt.")
      resetState(EPlayerType.Player);
    });

    connectionRef.current.on("onplayerListUpdated", (data) => {
      setPlayerCount(data);
    });

    return () => {
      connectionRef.current?.invoke("LeaveGame");
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
            <div style={{}}>
              {userType === 0 ? <PlayButton onClick={play} /> : ""}
            </div>
            <div className="user-animations">
              {starRefs.current.map((_, index) => (
                <div
                  key={index}
                  className="user-animation"
                  ref={(el) => (starRefs.current[index] = el)}
                />
              ))}
            </div>          </>
        );
      case States.Playing:
        return (
          <div className="container">
            {userType === EPlayerType.Drawer ?
                <div>
                  <p style={{ fontSize: "2em", padding: 0, margin: 0 }}>{String.fromCodePoint(parseInt(hexCode, 16))}</p>
                </div>
              :
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
                  <div key={index} onClick={() => submitEmoji(emoji)} >
                    <p style={{ fontSize: "2em", margin: "0" }}>  {String.fromCodePoint(parseInt(emoji.split("U+")[1], 16))}</p>
                  </div>
                ))}
              </div>
            }

            <Paint connection={connectionRef.current!} userState={userType!} />
          </div>
        );
      default:
        return null;
    }
  }

  async function submitEmoji(emoji: string): Promise<void> {
    if (!canSubmit) {
      console.log("Can't submit")
      return;
    }
    console.log(emoji)
    if (await connectionRef.current?.invoke("SubmitEmoji", emoji)) {
      await resetState(EPlayerType.Drawer);
      console.log("Sucees")
    } else {
      setCanSubmit(false)
      console.log("Fail")

    }
  }

  async function resetState(playerType: EPlayerType): Promise<void> {
    setUserType(playerType);
    setCurrentState(States.Ready);
    setCanSubmit(true);
    await connectionRef.current!.invoke<EPlayerType>("CreateGame");

  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      {renderComponent(currentState)}
    </div>
  );
}

export default App;
