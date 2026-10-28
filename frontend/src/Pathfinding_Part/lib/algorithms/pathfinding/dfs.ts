import { getUntraversedNeighbours } from "../../../utils/getUntraversedNeighbours";
import { checkStack, isEqual } from "../../../utils/helpers";
import type { GridType, TileType } from "../../../utils/types";

export const dfs = (grid: GridType, start: TileType, end: TileType) => {
  let traversedTiles: TileType[] = [];
  const base = grid[start.row][start.col];
  base.distance = 0;
  base.isTraversed = true;

  const untraversed: TileType[] = [base];

  while (untraversed.length > 0) {
    const currentTile = untraversed.pop() as TileType;
    if (currentTile.isWall) continue;
    if (currentTile.distance === Infinity) continue;
    traversedTiles.push(currentTile);
    if (isEqual(currentTile, end)) {
      break;
    }
    const neighbours = getUntraversedNeighbours(grid, currentTile);
    for (const neighbour of neighbours) {
      if (!checkStack(neighbour, untraversed)) {
        neighbour.distance = currentTile.distance + 1;
        neighbour.parent = currentTile;
        neighbour.isTraversed = true;
        untraversed.push(neighbour);
      }
    }
  }

  const path: TileType[] = [];
  let tile: TileType | null = grid[end.row][end.col];
  while (tile !== null) {
    tile.isPath = true;
    path.unshift(tile);
    tile = tile.parent;
  }

  return { traversedTiles, path };
}