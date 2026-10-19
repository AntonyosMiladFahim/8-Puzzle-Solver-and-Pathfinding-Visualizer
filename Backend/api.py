from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional
from Models import Node as node
from Search import search_function
from Heuristics import manhattan_distance, euclidean_distance

app = FastAPI()

class PuzzleRequest(BaseModel):
  state: List[List[int]]
  operation_mode: Literal["BFS", "DFS", "IDFS", "A"]
  heuristic: Literal["manhattan", "euclidean"]

class Step(BaseModel):
  state: List[List[int]]
  move: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"]

class Response(BaseModel):
  steps: List[Step]
  cost: float


@app.post("/solve", response_model=Response)
def solve(request: PuzzleRequest):
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
  intialState = request.state
  if not is_solvable(intialState):
    raise HTTPException(status_code=404, detail="Solution failed: As this state is unsolvable.")

  zero_x = -1
  zero_y = -1
  for row in range(len(intialState)):
    for col in range(len(intialState[0])):
      if intialState[row][col] == 0:
        zero_x = row
        zero_y = col
        break

  start_node: node = node(intialState, 0, 0, None, 0, request.operation_mode, "Start", zero_x, zero_y)

  if request.heuristic == "manhattan":
    heuristicFucntion = manhattan_distance
  else:
    heuristicFucntion = euclidean_distance

  inf = 1000000000000000
  answer: node

  if start_node.operation_mode == "IDFS":
    for i in range(inf):
      answer = search_function(
        start_node, i, start_node.operation_mode, heuristicFucntion, goal
      )
      if answer != None:
        break
  else:
    answer = search_function(
      start_node, inf, start_node.operation_mode, heuristicFucntion, goal
    )

  
  ansCost: float = answer.cost
  stepsList = []


  while answer.parent != None:
    move: Literal["UP", "DOWN", "LEFT", "RIGHT", "Start"] = answer.operation_made
    if move == "UP":
      move = "DOWN"
    elif move == "DOWN":
      move = "UP"
    elif move == "RIGHT":
      move = "LEFT"
    elif move == "LEFT":
      move = "RIGHT"
    
    step = Step(state=answer.state, move=move)
    stepsList.append(step)
    answer = answer.parent
  stepsList.reverse()


  return Response(steps=stepsList, cost=ansCost)



def is_solvable(state: List[List[int]]) -> bool:
  tot_inversions = 0
  state_array = []
  for row in range(len(state)):
    for col in range(len(state[0])):
      if state[row][col] != 0:
        state_array.append(state[row][col])

  for i in range(len(state_array)):
    inversions = 0
    for j in range(i+1, len(state_array)):
      if state_array[i] > state_array[j]:
        inversions += 1
    tot_inversions += inversions

  return tot_inversions % 2 == 0


