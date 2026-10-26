from Models import Node as node
from Search import search_function
from Heuristics import manhattan_distance, euclidean_distance

if __name__ == "__main__":
    goal: dict[int, tuple[int, int]] = {
        0: (0, 0),
        1: (0, 1),
        2: (0, 2),
        3: (1, 0),
        4: (1, 1),
        5: (1, 2),
        6: (2, 0),
        7: (2, 1),
        8: (2, 2),
    }
    start_state = [[1, 0, 4], [3, 5, 2], [6, 7, 8]]
    start_node: node = node(start_state, 0, 0, None, 0, "A", "Start", 0, 1)
    answer = search_function(
        start_node, 10, start_node.operation_mode, euclidean_distance, goal
    )
    if answer:
        answer = answer.goal_node 
        ans_cost = answer.cost

        steps: list = []

        while answer.parent != None:
            steps.append(answer)
            answer = answer.parent

        while steps:
            print(steps.pop().state)
        print(ans_cost)
    else:
        print("Failedd")
