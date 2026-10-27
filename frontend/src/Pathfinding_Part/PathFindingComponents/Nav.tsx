import { Select } from "./Select";
import { usePathfinding } from "../hooks/usePathfinding";
import { MAZES } from "../utils/constants";
import type { MazeType } from "../utils/types";
import { resetGrid } from "../utils/resetGrid";
import { useTile } from "../hooks/UseTile";
import { useState } from "react";
import { runMazeAlgorithm } from "../utils/runMazeAlgorithm";
import { useSpeed } from "../hooks/useSpeed";

export function Nav() {
  const [isDisabled, setIsDisabled] = useState(false);
  const { maze, setMaze, grid, setGrid, setIsGraphVisualized } =
    usePathfinding();
  const { startTile, endTile } = useTile();
  const { speed } = useSpeed();
  const handleGenerateMaze = (maze: MazeType) => {
    if (maze === "NONE") {
      setMaze(maze);
      resetGrid({ grid, startTile, endTile });
      return;
    }
    setMaze(maze);
    setIsDisabled(true);
    //run maze algorithm;
    runMazeAlgorithm({ maze, grid, startTile, endTile, setIsDisabled, speed });
    const newGrid = grid.slice();
    setGrid(newGrid);
    setIsGraphVisualized(false);
  };
  return (
    <div
      className="flex items-center justify-center min-h[4.5rem]
        border-b shadow-gray-600 sm:px-5 px-0
        "
    >
      <div className="flex items-center lg:justify-between justify-center w-full sm:w-[52rem]">
        <h1 className="lg:flex hidden w-[40%] text-2xl pl-1 text-white">
          Pathfinding Visualizer
        </h1>
        <div className="flex sm:items-end items-center justify-start sm:justify-between sm:flex-row flex-col sm:space-y-0 space-y-3 sm:py-0 py-4 sm:space-x-4">
          <Select
            label="Maze"
            value={maze}
            options={MAZES}
            isDisabled={isDisabled}
            onChange={(_e) => {
              handleGenerateMaze(_e.target.value as MazeType);
            }}
          />
        </div>
      </div>
    </div>
  );
}
