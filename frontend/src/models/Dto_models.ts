export type operation_mode = "BFS" | "DFS" | "IDFS" | "A";
export type heuristic = "manhattan" | "euclidean";
export type MoveDirection = "UP" | "DOWN" | "LEFT" | "RIGHT" | "Start";

export interface PuzzleRequest {
  state: Array<Array<number>>;
  operation_mode: operation_mode;
  heuristic: heuristic;
}

export interface Step {
  state: Array<Array<number>>;
  move: MoveDirection;
}

export interface Response {
  steps: Array<Step>;
  cost: number;
  time_taken: number;
  explored_nodes: Record<string, number>;
}
