from pydantic import BaseModel
from typing import List, Literal, Optional, Tuple


class PuzzleRequest(BaseModel):
    state: List[List[int]]
    operation_mode: Literal["BFS", "DFS", "IDFS", "A"]
    heuristic: Literal["manhattan", "euclidean"]


class Step(BaseModel):
    state: List[List[int]]
    move: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"]


class Response(BaseModel):
    steps: List[Step] | None = None
    cost: float | None = None
    time_taken: float | None = None
    explored_nodes: dict[str, float] | None = None
    explored_order: List[List[List[int]]] | None = None
    tree_nodes: List[Tuple[str, int, str, float]] | None = None
