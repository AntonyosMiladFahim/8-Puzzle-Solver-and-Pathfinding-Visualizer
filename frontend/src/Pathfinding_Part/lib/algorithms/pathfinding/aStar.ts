import { getUntraversedNeighbours } from "../../../utils/getUntraversedNeighbours";
import { dropFromQueue, isEqual } from "../../../utils/helpers";
import { initFunctionCost, initHeuristicCost } from "../../../utils/heuristics";
import type { GridType, TileType } from "../../../utils/types";

export const aStar = (
  grid: GridType,
  startTile: TileType,
  endTile: TileType,
) => {
  const traversedTiles = [];
  const heuristicCosts = initHeuristicCost(grid, endTile);
  const functionCost = initFunctionCost();
  const base = grid[startTile.row][startTile.col];
  base.distance = 0;
  functionCost[base.row][base.col] =
    base.distance + heuristicCosts[base.row][base.col];
  base.isTraversed = true;
  const untraversedTiles = [base];

  while (untraversedTiles.length > 0) {
    untraversedTiles.sort((a, b) => {
      if (functionCost[a.row][a.col] === functionCost[b.row][b.col]) {
        return b.distance - a.distance;
      } else {
        return functionCost[a.row][a.col] - functionCost[b.row][b.col];
      }
    });
    const currentTile = untraversedTiles.shift();
    if (currentTile) {
      if (currentTile.isWall) continue;
      if (currentTile.distance === Infinity) break;
      currentTile.isTraversed = true;
      traversedTiles.push(currentTile);
      if (isEqual(currentTile, endTile)) break;

      const neighbours = getUntraversedNeighbours(grid, currentTile);
      for (let i = 0; i < neighbours.length; i++) {
        const distanceToneighbor = currentTile.distance + 1;
        if (distanceToneighbor < neighbours[i].distance) {
          dropFromQueue(neighbours[i], untraversedTiles);
          neighbours[i].distance = distanceToneighbor;
          functionCost[neighbours[i].row][neighbours[i].col] =
            distanceToneighbor +
            heuristicCosts[neighbours[i].row][neighbours[i].col];
          neighbours[i].parent = currentTile;
          untraversedTiles.push(neighbours[i]);
        }
      }
    }
  }
  const path = [];
  let currect = grid[endTile.row][endTile.col];
  while (currect !== null) {
    currect.isPath = true;
    path.unshift(currect);
    currect = currect.parent!;
  }
  return { traversedTiles, path };
};
