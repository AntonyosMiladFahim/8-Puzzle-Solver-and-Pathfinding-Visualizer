from typing import ClassVar, List, Literal, Optional


class Node:
    state: List[List[int]]
    cost: float
    compare_Val: float
    parent: "Node"
    depth: int
    operation_mode: Literal["BFS", "DFS", "IDFS", "A"]
    zero_x: int
    zero_y: int

    def __init__(
        self,
        state: List[List[int]],
        cost: float,
        compare_Val: float,
        parent: "Node",
        depth: int,
        operation_mode: Literal["BFS", "DFS", "IDFS", "A"],
        operation_made: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"],
    ) -> None:
        self.state = state
        self.cost = cost
        self.compare_Val = compare_Val
        self.parent = parent
        self.depth = depth
        self.operation_mode = operation_mode
        self.operation_made = operation_made

    def __lt__(self, other: "Node"):
        return self.compare_Val < other.compare_Val

    def move(self, move: Literal["UP", "DOWN", "LEFT", "RIGHT"]) -> "Node":
        vertical_move = -1 if move == "UP" else 1 if move == "DOWN" else 0
        horizontal_move = -1 if move == "LEFT" else 1 if move == "RIGHT" else 0

        new_state_list = [x[:] for x in self.state]

        [
            new_state_list[self.zero_x][self.zero_y],
            new_state_list[self.zero_x + horizontal_move][self.zero_y + vertical_move],
        ] = [
            new_state_list[self.zero_x + horizontal_move][self.zero_y + vertical_move],
            new_state_list[self.zero_x][self.zero_y],
        ]

        depth = (
            -1 if self.operation_mode == "DFS" or self.operation_mode == "IDFS" else 1
        )

        new_state_node = Node(
            state=new_state_list,
            cost=self.cost + 1,
            compare_Val=self.cost + 1,
            parent=self,
            depth=self.depth + depth,
            operation_mode=self.operation_mode,
            operation_made=move,
        )

        return new_state_node
