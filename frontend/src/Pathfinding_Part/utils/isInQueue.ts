import type { TileType } from "./types";

export const isInQueue = (tile: TileType, queue: TileType[]): boolean => {
  for(let i = 0; i < queue.length; i++) {
    if(queue[i].row === tile.row && queue[i].col === tile.col) {
      return true
    }
  }
  return false
}