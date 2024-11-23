import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import "./App.css";

enum States {
  Lobby = "Lobby",
  Searching = "searching",
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

    try {
     await connection.invoke("JoinGame");
      console.log("joinned game")
      setTimeout(()=>{
        setCurrentState(States.Searching)
      },2000)
      
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
      console.log("change",()=>data);
    })

    connection.on("playerListUpdated",(data)=>{
      setPlayersNumber(data)
    })

  },[])



  function renderComponent(state:States) {
     
  
    switch (state) {
      case States.Lobby:
        return (
          <img
            className="play-button"
            onClick={joinGame}
            src="play-button.svg"
            alt=""
          />
        );
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
