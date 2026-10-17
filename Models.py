from typing import List, Literal


class Node:
    state: List[List[int]]
    cost: int
    compare_Val: int
    parent: "Node"
    depth: int
    operation_mode: Literal["BFS", "DFS", "IDFS", "A"]

    def __init__(
        self,
        state: List[List[int]],
        cost: int,
        compare_Val: int,
        parent: "Node",
        depth: int,
        operation_mode: Literal["BFS", "DFS", "IDFS", "A"],
    ) -> None:
        self.state = state
        self.cost = cost
        self.compare_Val = compare_Val
        self.parent = parent
        self.depth = depth
        self.operation_mode = operation_mode

    def __lt__(self, other: "Node"):
        if self.operation_mode == "A":
            return self.compare_Val < other.compare_Val
        elif self.operation_mode == "BFS":
            return self.compare_Val < other.compare_Val
        elif self.operation_mode == "DFS" or self.operation_mode == "IDFS":
            return self.compare_Val > other.compare_Val
