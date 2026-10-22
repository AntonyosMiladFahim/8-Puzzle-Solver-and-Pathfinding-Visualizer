import heapq
from Models import Node as node
from typing import Literal, Tuple
from collections.abc import Callable
from collections import deque
from Heuristics import unmatching_tiles
import json


class search_data:
    explored_nodes: dict[str, float]
    goal_node: node
    explored_order: list[list[list[int]]]
    tree_nodes: list[Tuple[str, int, str, float]]

    def __init__(
        self,
        explored_nodes: dict[str, float],
        goal_node: node,
        explored_order: list[list[list[int]]] | None = None,
        tree_nodes: list[Tuple[str, int, str, float]] | None = None,
    ) -> None:
        self.explored_nodes = explored_nodes
        self.goal_node = goal_node
        self.explored_order = explored_order or []
        self.tree_nodes = tree_nodes or []


def search_function(
    start_node: node,
    max_depth: int,
    search_type: Literal["BFS", "DFS", "IDFS", "A"],
    heuristic_function: Callable[[node, dict[int, tuple[int, int]]], float],
    goal: dict[int, tuple[int, int]],
) -> search_data | None:

    if search_type == "A":
        return A_star(start_node, heuristic_function, goal)
    elif search_type == "BFS":
        return BFS(start_node, goal)
    elif search_type == "DFS":
        return DFS(start_node, max_depth, goal)
    elif search_type == "IDFS":
        for depth_limit in range(max_depth):
            result = DFS(start_node, depth_limit, goal)
            if result is not None:
                return result
        return None
    return None


def A_star(
    start_node: node,
    heuristic_function: Callable[[node, dict[int, tuple[int, int]]], float],
    goal: dict[int, tuple[int, int]],
) -> search_data | None:
    heap = []
    hash_map: dict[str, float] = {}
    explored_order: list[list[list[int]]] = []
    tree_nodes: list[Tuple[str, int, str, float]] = []
    state_to_idx: dict[str, int] = {}

    start_node.compare_Val = start_node.cost + heuristic_function(start_node, goal)
    heapq.heappush(heap, start_node)

    while heap:
        current_node: node = heapq.heappop(heap)
        current_state_key = json.dumps(current_node.state)

        if hash_map.get(current_state_key, (float("inf"))) < current_node.compare_Val:
            continue

        hash_map[current_state_key] = current_node.compare_Val
        if len(explored_order) < 5000:
            explored_order.append(current_node.state)

        curr_str = "".join(str(n) for row in current_node.state for n in row)
        parent_str = "".join(str(n) for row in current_node.parent.state for n in row) if current_node.parent else None
        p_idx = state_to_idx.get(parent_str, -1) if parent_str else -1
        state_to_idx[curr_str] = len(tree_nodes)
        tree_nodes.append((curr_str, p_idx, current_node.operation_made, current_node.compare_Val))

        if unmatching_tiles(current_node, goal) == 0:
            return search_data(hash_map, current_node, explored_order, tree_nodes)

        next_states: list[Literal["UP", "DOWN", "LEFT", "RIGHT"]] = get_next_states(current_node)
        next_nodes: list[node] = []
        for state in next_states:
            next_node = current_node.move(move=state)
            next_nodes.append(next_node)

        for next_node in next_nodes:
            next_node.compare_Val = next_node.cost + heuristic_function(next_node, goal)
            next_state_key = json.dumps(next_node.state)
            if (not (next_state_key in hash_map)) or hash_map.get(
                next_state_key, (float("inf"))
            ) > next_node.compare_Val:
                hash_map[next_state_key] = next_node.compare_Val
                heapq.heappush(heap, next_node)
    return None


def BFS(start_node: node, goal: dict[int, tuple[int, int]]) -> search_data | None:
    queue = deque([start_node])
    hash_map: dict[str, float] = {}
    explored_order: list[list[list[int]]] = []
    tree_nodes: list[Tuple[str, int, str, float]] = []
    state_to_idx: dict[str, int] = {}
    hash_map[json.dumps(start_node.state)] = start_node.compare_Val

    while queue:
        current_node: node = queue.popleft()
        if len(explored_order) < 5000:
            explored_order.append(current_node.state)

        curr_str = "".join(str(n) for row in current_node.state for n in row)
        parent_str = "".join(str(n) for row in current_node.parent.state for n in row) if current_node.parent else None
        p_idx = state_to_idx.get(parent_str, -1) if parent_str else -1
        state_to_idx[curr_str] = len(tree_nodes)
        tree_nodes.append((curr_str, p_idx, current_node.operation_made, current_node.compare_Val))

        if unmatching_tiles(current_node, goal) == 0:
            return search_data(hash_map, current_node, explored_order, tree_nodes)

        next_states: list[Literal["UP", "DOWN", "LEFT", "RIGHT"]] = get_next_states(current_node)
        next_nodes: list[node] = []
        for state in next_states:
            next_node = current_node.move(move=state)
            next_nodes.append(next_node)

        for next_node in next_nodes:
            next_state_key = json.dumps(next_node.state)
            if not (next_state_key in hash_map):
                hash_map[next_state_key] = next_node.compare_Val
                queue.append(next_node)
    return None


def DFS(
    start_node: node, max_depth: int, goal: dict[int, tuple[int, int]]
) -> search_data | None:
    stack = list([start_node])
    hash_map: dict[str, float] = {}
    explored_order: list[list[list[int]]] = []
    tree_nodes: list[Tuple[str, int, str, float]] = []
    state_to_idx: dict[str, int] = {}
    hash_map[json.dumps(start_node.state)] = start_node.compare_Val

    while stack:
        current_node: node = stack.pop()
        current_state_key = json.dumps(current_node.state)

        hash_map[current_state_key] = current_node.compare_Val
        if len(explored_order) < 5000:
            explored_order.append(current_node.state)

        curr_str = "".join(str(n) for row in current_node.state for n in row)
        parent_str = "".join(str(n) for row in current_node.parent.state for n in row) if current_node.parent else None
        p_idx = state_to_idx.get(parent_str, -1) if parent_str else -1
        state_to_idx[curr_str] = len(tree_nodes)
        tree_nodes.append((curr_str, p_idx, current_node.operation_made, current_node.compare_Val))

        if unmatching_tiles(current_node, goal) == 0:
            return search_data(hash_map, current_node, explored_order, tree_nodes)

        if current_node.depth >= max_depth:
            continue

        next_states: list[Literal["UP", "DOWN", "LEFT", "RIGHT"]] = get_next_states(current_node)
        next_states.reverse()
        next_nodes: list[node] = []
        for state in next_states:
            next_node = current_node.move(move=state)
            next_nodes.append(next_node)

        for next_node in next_nodes:
            next_state_key = json.dumps(next_node.state)
            if not (next_state_key in hash_map):
                hash_map[next_state_key] = next_node.compare_Val
                stack.append(next_node)

    return None


def get_next_states(current_node: node) -> list[Literal["UP", "DOWN", "LEFT", "RIGHT"]]:
    next_moves: list[Literal["UP", "DOWN", "LEFT", "RIGHT"]] = []

    n = len(current_node.state)
    m = len(current_node.state[0])

    if current_node.zero_x != 0:
        next_moves.append("UP")
    if current_node.zero_x != n - 1:
        next_moves.append("DOWN")
    if current_node.zero_y != 0:
        next_moves.append("LEFT")
    if current_node.zero_y != m - 1:
        next_moves.append("RIGHT")

    return next_moves
