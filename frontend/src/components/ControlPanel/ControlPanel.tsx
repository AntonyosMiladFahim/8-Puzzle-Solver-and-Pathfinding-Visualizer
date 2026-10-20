import type React from "react";
import type { tileInfo } from "../Board/Board";
import { useState } from "react";
import { solve_state } from "../../services/servicesHandler";
import type {
  Response,
  PuzzleRequest,
  operation_mode,
  heuristic,
} from "../../models/Dto_models";

type ControlPanelprops = {
  matrix: Array<tileInfo>;
  setMatrix: React.Dispatch<React.SetStateAction<Array<tileInfo>>>;
  run_algorithm: (states: Array<Array<Array<number>>>) => void;
};

function ControlPanel({ matrix, setMatrix, run_algorithm }: ControlPanelprops) {
  const [newState, setnewState] = useState<string>("012345678");
  const [heuristic_value, setheuristic_value] =
    useState<heuristic>("manhattan");
  const [algorithm, setAlgorithm] = useState<operation_mode>("BFS");

  function handle_submit_click(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(event.currentTarget);
    if (newState.length != 9) {
      return;
    }
    const character_set: Set<string> = new Set();

    for (const c of newState) {
      character_set.add(c);
    }

    if (character_set.size == 9) {
      const updated: Array<tileInfo> = [...newState].map((c, index) => {
        const t: tileInfo = { value: Number.parseInt(c), index: index };
        return t;
      });

      setMatrix(updated);
    }
    return;
  }

  function handle_reset_click(event: React.MouseEvent<HTMLButtonElement>) {
    let initial_state: string = "";
    const character_set: Set<string> = new Set();
    for (let i = 0; i < 9; i++) {
      character_set.add(i.toString());
    }

    for (let i = 0; i < 9; i++) {
      const size = character_set.size;
      const index = Math.floor(Math.random() * size);
      const char = Array.from(character_set)[index];
      initial_state = initial_state + char;
      character_set.delete(char);
      console.log(character_set);
    }
    const updated_state: Array<tileInfo> = [...initial_state].map((c, i) => {
      const t: tileInfo = { value: Number.parseInt(c), index: i };
      return t;
    });
    setMatrix(updated_state);
  }
  function handle_onchange(e: React.ChangeEvent<HTMLInputElement>) {
    const mutated_state: string = e.target.value;

    if (mutated_state.length > 9) return;
    for (const c of mutated_state) {
      if (c < "0" || c > "8") {
        return;
      }
    }

    setnewState(e.target.value);
  }

  function handle_solve(event: React.MouseEvent<HTMLButtonElement>) {
    const request_array = Array.from({ length: 3 }, () =>
      Array<number>(3).fill(0),
    );

    for (let i = 0; i < matrix.length; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      request_array[row][col] = matrix[i].value;
    }

    const PuzzleRequest: PuzzleRequest = {
      state: request_array,
      operation_mode: algorithm,
      heuristic: heuristic_value,
    };
    solve_state(PuzzleRequest)
      .then((response) => {
        if (response == null) return;
        else {
          const resullt = Array.from(response.steps.map((s) => s.state));

          run_algorithm(resullt);
        }
      })
      .catch((e) => console.log(e));
  }

  return (
    <div className="controlPanel">
      <div className="header">Ai Lab 1</div>

      <div className="input">
        <label>
          Enter the order of numbers you want
          <input type="text" value={newState} onChange={handle_onchange} />
        </label>
        <div>
          <button onClick={handle_solve}>Solve</button>
          <button type="submit" onClick={handle_submit_click}>
            change_state
          </button>
          <button type="reset" onClick={handle_reset_click}>
            Reset
          </button>

          <select
            onChange={(e) => setAlgorithm(e.target.value as operation_mode)}
            required
          >
            <option label="BFS" value={"BFS"}></option>
            <option label="DFS" value={"DFS"}></option>
            <option label="IDFS" value={"IDFS"}></option>
            <option label="A*" value={"A"}></option>
          </select>
          {algorithm == "A" && (
            <select
              onChange={(e) => setheuristic_value(e.target.value as heuristic)}
              required
            >
              <option label="manhattan"></option>
              <option label="euclidean"></option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
export default ControlPanel;
