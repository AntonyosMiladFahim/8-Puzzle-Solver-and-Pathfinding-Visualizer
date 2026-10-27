import { bfs } from "../lib/algorithms/pathfinding/bfs";
import type { AlgorithmType, GridType, TileType } from "./types";

export const runPathFindingAlgorithm = async (
  algoithm: AlgorithmType,
  grid: GridType,
  startTile: TileType,
  endTile: TileType,
) => {
  switch (algoithm) {
    case "BFS":
      return bfs(grid, startTile, endTile);
      default:
      return;
  } 
}