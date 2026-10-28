import { aStar } from "../lib/algorithms/pathfinding/aStar";
import { bfs } from "../lib/algorithms/pathfinding/bfs";
import { dfs } from "../lib/algorithms/pathfinding/dfs";
import { dijkstra } from "../lib/algorithms/pathfinding/dijkstra";
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
    case "DFS":
      return dfs(grid, startTile, endTile);
    case "UCS":
      return dijkstra(grid, startTile, endTile);
    case "A_STAR":
      return aStar(grid, startTile, endTile);
  }
};
