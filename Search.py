import heapq
from Models import Node as node
from typing import Literal 
from collections.abc import Callable
from Heuristics import unmatching_tiles
import json

def search_function(start_node : node, max_depth : int, search_type : Literal["BFS", "DFS", "IDFS", "A"], heuristic_function : Callable[[node, dict[int, tuple[int, int]]], float], goal: dict[int, tuple[int, int]]): 
  heap = []
  hash_map = {}
  heapq.heappush(heap, start_node)

  # print("enter search funstion")
  while heap:
    current_node : node = heapq.heappop(heap)
    current_state_key = json.dumps(current_node.state)

    if hash_map.get(current_state_key, (float("inf"))) < current_node.compare_Val : 
      continue

    # print("assign hash map val")
    print(current_node.state)
    hash_map[current_state_key] = current_node.compare_Val
    if unmatching_tiles(current_node, goal) == 0:
      return current_node
    
    if current_node.depth < max_depth:
      next_states : list[str] = get_next_states(current_node)
      next_nodes : list[node] = []
      for state in next_states:
        # print("getting children")

        next_node = current_node.move(move=state)
        next_nodes.append(next_node)

      for next_node in next_nodes:
        if search_type == "A":
          next_node.compare_Val +=  heuristic_function(next_node, goal)
        # print("moving to children")
        next_state_key = json.dumps(next_node.state)
        if (not (next_state_key in hash_map) ) or hash_map.get(next_state_key, (float("inf"))) > next_node.compare_Val : 
          hash_map[next_state_key] = next_node.compare_Val        
          heapq.heappush(heap, next_node)
  return "cant find"
  

def get_next_states(current_node : node):
  next_moves : list[str] = []

  n = len(current_node.state)
  m = len(current_node.state[0])

  if current_node.zero_x != 0:
    next_moves.append("UP")
  if current_node.zero_x != n-1:
    next_moves.append("DOWN")
  if current_node.zero_y != 0:
    next_moves.append("LEFT")
  if current_node.zero_y != m-1:
    next_moves.append("RIGHT")
  
  return next_moves
