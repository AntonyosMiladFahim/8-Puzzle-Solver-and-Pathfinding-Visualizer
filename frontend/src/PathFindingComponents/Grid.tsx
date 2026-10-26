import { twMerge } from "tailwind-merge";
import { usePathfinding } from "../hooks/usePathfinding";
import { MAX_COLS, MAX_ROWS } from "../utils/constants";
import { Tile } from "./tile";
import { useState, type RefObject } from "react";
import { checkisStartOrEnd, createNewGrid } from "../utils/helpers";

export function Grid({
  isVisualizedRunningRef,
}: {
  isVisualizedRunningRef: RefObject<boolean>;
}) {
  const { grid, setGrid } = usePathfinding();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizedRunningRef.current || checkisStartOrEnd(row, col)) return;
    setIsMouseDown(true);
    const newGrid = createNewGrid(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = (row: number, col: number) => {
    if (isVisualizedRunningRef.current || checkisStartOrEnd(row, col)) return;
    setIsMouseDown(false);
  };
  const handleMouseEnter = (row: number, col: number) => {
    if (isVisualizedRunningRef.current || checkisStartOrEnd(row, col)) return;
    if (isMouseDown) {
      const newGrid = createNewGrid(grid, row, col);
      setGrid(newGrid);
    }
  };
  return (
    <div
      className={twMerge(
        "flex item-center flex-col justify-center border-sky-300 mt-10",
        `lg:min-h-[${MAX_ROWS * 17}px] md:min-h-[${MAX_ROWS * 15}px]
        xs:min-h-[${MAX_ROWS * 17}px] min-h-[${MAX_ROWS * 7}px]`,
        `lg:min-w-[${MAX_COLS * 17}px] md:min-w-[${MAX_COLS * 15}px]
        xs:min-w-[${MAX_COLS * 17}px] min-w-[${MAX_COLS * 7}px]`,
      )}
    >
      {grid.map((r, rowindx) => (
        <div key={rowindx} className="flex">
          {r.map((tile, tileIndex) => {
            const { row, col, isEnd, isStart, isPath, isTraversed, isWall } =
              tile;
            return (
              <Tile
                key={tileIndex}
                row={tile.row}
                col={tile.col}
                isEnd={isEnd}
                isStart={isStart}
                isPath={isPath}
                isTraversed={isTraversed}
                isWall={isWall}
                handleMouseDown={() => handleMouseDown(row, col)}
                handleMouseUp={() => handleMouseUp(row, col)}
                handleMouseEnter={() => handleMouseEnter(row, col)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
