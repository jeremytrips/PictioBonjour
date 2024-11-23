import { useState } from "react";
import "./App.css";

enum States {
  Lobby = "Lobby",
  Searching = "searching",
  Playing = "playing",
  Done = "done",
}

function App() {
  const [currentState, setCurrentState] = useState(States.Lobby);

  const renderComponent = () => {
    switch (currentState) {
      case States.Lobby:
        return (
          <img
            className="play-button"
            onClick={() => setCurrentState(States.Searching)}
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

  return <div className="container">{renderComponent()}</div>;
}

export default App;
