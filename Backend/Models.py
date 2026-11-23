from typing import ClassVar, List, Literal, Optional


class Node:
    state: List[List[int]]
    cost: float
    compare_Val: float
    parent: Optional["Node"] = None
    depth: int
    operation_mode: Literal["BFS", "DFS", "IDFS", "A"]
    operation_made: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"]
    zero_x: int
    zero_y: int

    def __init__(
        self,
        state: List[List[int]],
        cost: float,
        compare_Val: float,
        parent: Optional["Node"],
        depth: int,
        operation_mode: Literal["BFS", "DFS", "IDFS", "A"],
        operation_made: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"],
        zero_x: int,
        zero_y: int,
    ) -> None:
        self.state = state
        self.cost = cost
        self.compare_Val = compare_Val
        self.parent = parent
        self.depth = depth
        self.operation_mode = operation_mode
        self.operation_made = operation_made
        self.zero_x = zero_x
        self.zero_y = zero_y

    def __lt__(self, other: "Node"):
        return self.compare_Val < other.compare_Val

    # taken in a move that need to be done on the current state and generated the child state from parents
    def move(self, move: Literal["UP", "DOWN", "LEFT", "RIGHT"]) -> "Node":
        vertical_move = -1 if move == "UP" else 1 if move == "DOWN" else 0
        horizontal_move = -1 if move == "LEFT" else 1 if move == "RIGHT" else 0

        new_state_list = [x[:] for x in self.state]

        [
            new_state_list[self.zero_x][self.zero_y],
            new_state_list[self.zero_x + vertical_move][self.zero_y + horizontal_move],
        ] = [
            new_state_list[self.zero_x + vertical_move][self.zero_y + horizontal_move],
            new_state_list[self.zero_x][self.zero_y],
        ]

        new_state_node = Node(
            state=new_state_list,
            cost=self.cost + 1,
            compare_Val=self.compare_Val + 1,
            parent=self,
            depth=self.depth + 1,
            operation_mode=self.operation_mode,
            operation_made=move,
            zero_x=self.zero_x + vertical_move,
            zero_y=self.zero_y + horizontal_move,
        )

        return new_state_node
