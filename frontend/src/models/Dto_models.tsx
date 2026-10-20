type operation_mode = "BFS"|"DFS"|"IDFS"|"A";
type heuristic = "manhattan"|"euclidean";
export interface PuzzleRequest{
    state: Array<Array<number>>
    operation_mode: operation_mode
    heuristic:heuristic
}


interface Step{
    state: Array<Array<number>>
    move: operation_mode
}
export interface Response{
    steps: Array<Step>
    cost: number
    time_taken: number
}