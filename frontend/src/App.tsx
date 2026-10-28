import { useState, useRef } from "react";
import Board from "./components/Board/Board";
import { PathfindingProvider } from "./Pathfinding_Part/context/PathfindinContext";
import { TileProvider } from "./Pathfinding_Part/context/TileContext";
import { SpeedProvider } from "./Pathfinding_Part/context/SpeedContext";
import { Nav } from "./Pathfinding_Part/PathFindingComponents/Nav";
import { Grid } from "./Pathfinding_Part/PathFindingComponents/Grid";
import "./App.css";

type AppMode = "puzzle" | "pathfinding";

function App() {
  const [mode, setMode] = useState<AppMode>("puzzle");
  const isVisualizationRunningRef = useRef(false);

  return (
    <div className="mainAppLayout">
      <header className="topNavBar">
        <div className="navBrand">
          <div className="brandLogo">AI</div>
          <div className="brandText">
            <span className="brandTitle">Intelligence Lab</span>
            <span className="brandSubtitle">Search & Pathfinding Systems</span>
          </div>
        </div>

        <nav className="modeSwitchGroup" aria-label="Application Module Switcher">
          <button
            type="button"
            className={`modeSwitchBtn ${mode === "puzzle" ? "active" : ""}`}
            onClick={() => setMode("puzzle")}
          >
            <span className="modeIcon">🧩</span>
            <span>8-Puzzle Solver</span>
          </button>
          <button
            type="button"
            className={`modeSwitchBtn ${mode === "pathfinding" ? "active" : ""}`}
            onClick={() => setMode("pathfinding")}
          >
            <span className="modeIcon">🗺️</span>
            <span>Pathfinding & Mazes</span>
          </button>
        </nav>
      </header>

      <main className="viewContainer">
        {mode === "puzzle" ? (
          <div className="puzzleView">
            <Board />
          </div>
        ) : (
          <div className="pathfindingView">
            <PathfindingProvider>
              <TileProvider>
                <SpeedProvider>
                  <Nav isVisualizedRunningRef={isVisualizationRunningRef} />
                  <Grid isVisualizedRunningRef={isVisualizationRunningRef} />
                </SpeedProvider>
              </TileProvider>
            </PathfindingProvider>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
