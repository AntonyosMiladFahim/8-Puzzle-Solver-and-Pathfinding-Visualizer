from pydantic import BaseModel
from typing import List, Literal, Optional
from Models import Node as node


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
