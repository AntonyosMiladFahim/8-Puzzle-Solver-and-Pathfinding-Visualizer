import { getUntraversedNeighbours } from "../../../utils/getUntraversedNeighbours";
import { isEqual } from "../../../utils/helpers";
import { isInQueue } from "../../../utils/isInQueue";
import type { GridType, TileType } from "../../../utils/types";

export const bfs = (grid: GridType, startTile: TileType, endTile: TileType) => {
  const traversedTiles: TileType[] = [];
  const base = grid[startTile.row][startTile.col];
  base.distance = 0
  base.isTraversed = true
  const untraversed: TileType[] = [base]


  while (untraversed.length > 0) {
    const tile = untraversed.shift() as TileType;
    if(tile.isWall) continue;
    if(tile.distance === Infinity) continue;
    traversedTiles.push(tile);
    if(isEqual(tile, endTile)) {
      break
    }
    const neighbours = getUntraversedNeighbours(grid, tile)
    for(const neighbour of neighbours) {
      if(!isInQueue(neighbour, untraversed)) {
        neighbour.distance = tile.distance + 1
        neighbour.parent = tile
        neighbour.isTraversed = true
        untraversed.push(neighbour)
      }
    }
  }

  const path: TileType[] = []
  let tile: TileType | null = grid[endTile.row][endTile.col]
  while(tile !== null) {
    tile.isPath = true
    path.unshift(tile)
    tile = tile.parent  
  }

  return {traversedTiles, path}

}