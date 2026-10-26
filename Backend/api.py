from fastapi import FastAPI, HTTPException
from Dto import Response, PuzzleRequest
from typing import List
from Search import search_function
from Heuristics import manhattan_distance, euclidean_distance
from solvingWrapper import solveWrapper
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    if any(len(r) != 3 for r in intialState) or sorted(v for r in intialState for v in r) != list(range(9)):
        raise HTTPException(status_code=422, detail="State must be a 3x3 permutation of 0-8.")
    if not is_solvable(intialState):
        print("Unsolvable")
        raise HTTPException(
            status_code=404, detail="Solution failed: As this state is unsolvable."
        )
    inf = 1000000000000000
    Response: "Response" = solveWrapper().solve(
        request=request, max_depth=inf, goal=goal
    )
    print(Response.time_taken)
    return Response


def is_solvable(state: List[List[int]]) -> bool:
    tot_inversions = 0
    state_array = []
    for row in range(len(state)):
        for col in range(len(state[0])):
            if state[row][col] != 0:
                state_array.append(state[row][col])

    for i in range(len(state_array)):
        inversions = 0
        for j in range(i + 1, len(state_array)):
            if state_array[i] > state_array[j]:
                inversions += 1
        tot_inversions += inversions

    return tot_inversions % 2 == 0


if __name__ == "__main__":
    uvicorn.run("api:app", port=8080, log_level="info", reload=True)
