import Board from "./components/Board/Board";
import { PathfindingProvider } from "./context/PathfindinContext";
function App() {
  return (
    <PathfindingProvider>
      <h1 className="text-3xl font-bold underline h-screen w-screen bg-blue-500"></h1>
    </PathfindingProvider>
    // <div className='App'>
    //   <Board/>
    // </div>
  );
}

export default App;
