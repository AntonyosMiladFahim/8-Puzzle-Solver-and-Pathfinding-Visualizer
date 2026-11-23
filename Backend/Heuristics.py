from Models import Node as node
import math


# absolute distance between the tile position now and the position of it in the final state
# more admissible than euclidean due to the fact it estimated the true cost more accurately
def manhattan_distance(Node: node, map: dict[int, tuple[int, int]]) -> float:
    # '0' -> (x,y)
    val: float = 0
    for row in range(len(Node.state)):
        for col in range(len(Node.state[row])):
            if Node.state[row][col] == 0:
                continue
            val += abs(map.get(Node.state[row][col], (0, 0))[0] - row)
            val += abs(map.get(Node.state[row][col], (0, 0))[1] - col)

    return val


# Euclidean distance between the tile position now and the position of it in the final state
def euclidean_distance(Node: node, map: dict[int, tuple[int, int]]) -> float:
    val: float = 0
    for row in range(len(Node.state)):
        for col in range(len(Node.state[row])):
            if Node.state[row][col] == 0:
                continue
            dx: float = map.get(Node.state[row][col], (0, 0))[0] - row
            dy: float = map.get(Node.state[row][col], (0, 0))[1] - col
            val += math.sqrt((dx * dx) + (dy * dy))

    return val


def unmatching_tiles(Node: node, map: dict[int, tuple[int, int]]):
    val: float = 0
    for row in range(len(Node.state)):
        for col in range(len(Node.state[row])):
            val += 0 if map.get(Node.state[row][col], (-1, -1)) == (row, col) else 1
    return val
