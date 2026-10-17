import heapq
from Models import Node as node
from typing import Literal 

def search_function(start_node : node, goal_test : function, max_depth : int, search_type : Literal["BFS", "DFS", "IDFS", "A"]):
  heap = []
  hash_map = {node}
  hash_map[start_node] = 0
  heapq.heappush(heap,(start_node.compare_val, start_node))

  while heap:
    current_node : node = heapq.heappop(heap)[1]
    if current_node in hash_map and hash_map[current_node].compare_val < current_node.compare_val : 
      continue
    if goal_test(current_node):
      break
    if current_node.depth < max_depth:
      next_states : list[str] = get_next_states(current_node)
      next_nodes : list[node]  
      for state in next_states:
        next_node = node.move(state)
        next_nodes.append(next_node)

      for next_node in next_nodes:
        hash_map[current_node] = current_node.cost
        heapq.heappush(heap, (current_node.compare_val, current_node))

def get_next_states(current_node : node):
  next_moves : list[str]

  n = len(current_node.state)
  m = len(current_node.state[0])

  if current_node.zero_x != 0:
    next_moves.append("up")
  if current_node.zero_x != n-1:
    next_moves.append("DOWN")
  if current_node.zero_y != 0:
    next_moves.append("LEFT")
  if current_node.zero_y != m-1:
    next_moves.append("RIGHT")
  
  return next_moves

    
