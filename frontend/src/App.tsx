import { useRef } from "react";
import { PathfindingProvider } from "./context/PathfindinContext";
import { SpeedProvider } from "./context/SpeedContext";
import { TileProvider } from "./context/TileContext";
import { Grid } from "./PathFindingComponents/Grid";
import { Nav } from "./PathFindingComponents/Nav";
function App() {
  const isVisualizationRunningRef = useRef(false);
  return (
    <PathfindingProvider>
      <TileProvider>
        <SpeedProvider>
          <div className="h-screen w-screen flex flex-col">
            <Nav />
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
