import { useState } from "react";
import "./Board.css";
import Tile from "../Tiles/Tile";
import ControlPanel from "../ControlPanel/ControlPanel";
export interface tileInfo {
  value: number;
  index: number;
}
function Board() {
  const len = 9;

  const generate_array = () => {
    return new Array<tileInfo>(len)
      .fill({ value: 0, index: 0 })
      .map((_, i) => {
        return i;
      })
      .sort(() => Math.random() - 0.5)
      .map((x, i) => ({ value: x, index: i }));
  };

  const [matrix, setMatrix] = useState<Array<tileInfo>>(generate_array());
  console.log(matrix);

  function run_algorithm(states: Array<Array<Array<number>>>) {
    solve_puzzle(states);
  }

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const solve_puzzle = async (Steps: Array<Array<Array<number>>>) => {
    console.log(Steps);
    const states: Array<Array<number>> = Steps.map((array) => {
      return array.flat();
    });

    for (const state of states) {
      const newMatrix: Array<tileInfo> = state.map((number, index) => {
        return { value: number, index: index };
      });
      setMatrix(newMatrix);
      await delay(1000);
    }
  };

  return (
    <div>
      <ControlPanel
        setMatrix={setMatrix}
        matrix={matrix}
        run_algorithm={run_algorithm}
      />
      <div className="Board">
        {matrix.map((tileInfo) => (
          <Tile
            key={tileInfo.value}
            val={tileInfo.value}
            index={tileInfo.index}
          />
        ))}
      </div>
    </div>
  );
}
export default Board;
