import type { GridType, MazeType, SpeedType, TileType } from "./types";
import { constructBorder } from "./constructBorder";
import { MAX_COLS, MAX_ROWS, SPEEDS } from "./constants";
import recursiveDivision from "../lib/algorithms/maze/recursiveDivision";
import { binaryTree } from "../lib/algorithms/maze/binaryTree";

export const runMazeAlgorithm = async ({
  maze,
  grid,
  startTile,
  endTile,
  setIsDisabled,
  speed,
}: {
  maze: MazeType;
  grid: GridType;
  startTile: TileType;
  endTile: TileType;
  setIsDisabled: (isDisabled: boolean) => void;
  speed: SpeedType;
}) => {
  if (maze == "BINARY_TREE") {
    await binaryTree(grid, startTile, endTile, setIsDisabled, speed);
  }else if (maze == "RECURSIVE_DIVISION") {
    const currentSpeed = SPEEDS.find((s) => s.value === speed)?.value || 2;
    await constructBorder(grid, startTile, endTile);
    await recursiveDivision(
      grid,
      startTile,
      endTile,
      1,
      1,
      Math.floor((MAX_ROWS - 1) / 2),
      Math.floor((MAX_COLS - 1) / 2),
      setIsDisabled,
      speed
    );
    setTimeout(() => {}, 800 * currentSpeed);
  }
};
