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

function App() {
  const [currentState, setCurrentState] = useState(States.Lobby);
  const [connection,setConnection] = useState<HubConnection|null>(null)
  const [playersNumber, setPlayersNumber] = useState(0)
  

  async function joinGame(){
    if(!connection){
      return 
    }

    setCurrentState(States.Searching)
    try {
      await connection.invoke("JoinGame");
    } catch (error) {
      console.error(error) 
    }
  }

  useEffect(()=>{

    const connection = new HubConnectionBuilder()
    .withUrl("http://localhost:5095/hub/game") 
    .withAutomaticReconnect() 
    .configureLogging(LogLevel.Information) 
    .build();

    setConnection(connection)

    connection.start()
      .then(()=>{
        console.log("connected")
      })
      .catch((error)=>{
        console.error(error)
      })

    connection.on("onStatusChanged",(data)=>{
      setCurrentState(States.Ready)
      console.log(data);
    })

    connection.on("playerListUpdated",(data)=>{
      console.log("playerListUpdated",data)
      setPlayersNumber(data)
    })
    return()=>{
      connection.invoke("OnLeaveGame");
      // connection.off("onStatusChanged");
      // connection.off("playerListUpdated");
      connection.stop();
    }
  },[])



  function renderComponent(state:States) {
     
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

  return <div className="container">{renderComponent(currentState)}</div>;
}

export default App;
