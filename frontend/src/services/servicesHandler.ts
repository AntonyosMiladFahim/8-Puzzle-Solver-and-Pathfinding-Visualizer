import axios from "axios";
import type { PuzzleRequest, Response } from "../models/Dto_models";

const Base_URL = "http://localhost:8080/solve";

export async function solve_state(
  PuzzleRequest: PuzzleRequest,
): Promise<Response | null> {
  let response: Response | null = null;
  await axios
    .post<Response>(Base_URL, PuzzleRequest)
    .then((api_response) => {
      const data = api_response.data;
      response = {
        cost: data.cost,
        steps: data.steps,
        time_taken: data.time_taken,
        explored_nodes: data.explored_nodes,
        explored_order: data.explored_order,
        tree_nodes: data.tree_nodes,
      };
    })
    .catch((error) => {
      console.log(error);
    });
  return response;
}
