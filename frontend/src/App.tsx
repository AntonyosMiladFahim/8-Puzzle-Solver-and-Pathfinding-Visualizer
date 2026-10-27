import { useRef } from "react";
import { PathfindingProvider } from "./Pathfinding_Part/context/PathfindinContext";
import { TileProvider } from "./Pathfinding_Part/context/TileContext";
import { SpeedProvider } from "./Pathfinding_Part/context/SpeedContext";
import { Nav } from "./Pathfinding_Part/PathFindingComponents/Nav";
import { Grid } from "./Pathfinding_Part/PathFindingComponents/Grid";

function App() {
  const isVisualizationRunningRef = useRef(false);
  return (
    <PathfindingProvider>
      <TileProvider>
        <SpeedProvider>
          <div className="h-screen w-screen flex flex-col">
            <Nav  isVisualizedRunningRef={isVisualizationRunningRef}/>
            <Grid isVisualizedRunningRef={isVisualizationRunningRef} />
          </div>
        </SpeedProvider>
      </TileProvider>
    </PathfindingProvider>
    // <div className='App'>
    //   <Board/>
    // </div>
  );
}

export default App;
