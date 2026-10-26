from typing import List, Literal, Callable
from Dto import Step, Response, PuzzleRequest
from Models import Node as node
from Heuristics import manhattan_distance, euclidean_distance
from Search import search_function, search_data
import time


class solveWrapper:

    def solve(
        self,
        request: PuzzleRequest,
        max_depth: int,
        goal: dict[int, tuple[int, int]],
    ) -> Response:
        intialState = request.state

        zero_x = -1
        zero_y = -1
        for row in range(len(intialState)):
            for col in range(len(intialState[0])):
                if intialState[row][col] == 0:
                    zero_x = row
                    zero_y = col
                    break
        heuristic = request.heuristic
        operation_mode = request.operation_mode
        start_node: node = node(
            intialState, 0, 0, None, 0, operation_mode, "Start", zero_x, zero_y
        )
        if heuristic == "manhattan":
            heuristicFucntion = manhattan_distance
        else:
            heuristicFucntion = euclidean_distance

        inf = float("inf")
        answer: search_data | None = None

        start_time = time.perf_counter()
        answer = search_function(
            start_node, max_depth, operation_mode, heuristicFucntion, goal
        )
        end_time = time.perf_counter()

        excution_time = end_time - start_time

        if answer is None:
            return Response(steps=None, cost=None, time_taken=None)

        goal_state = answer.goal_node
        ansCost: float = goal_state.cost
        stepsList = []

        while goal_state.parent != None:
            move: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"] = (
                goal_state.operation_made
            )
            if move == "UP":
                move = "DOWN"
            elif move == "DOWN":
                move = "UP"
            elif move == "RIGHT":
                move = "LEFT"
            elif move == "LEFT":
                move = "RIGHT"

            step = Step(state=goal_state.state, move=move)
            stepsList.append(step)
            goal_state = goal_state.parent
        stepsList.reverse()

        response_entity: Response = Response(
            steps=stepsList,
            cost=ansCost,
            time_taken=excution_time,
            explored_nodes=answer.explored_nodes,
            explored_order=answer.explored_order,
            tree_nodes=answer.tree_nodes if len(stepsList) <= 20 else None,
        )
        return response_entity
