import type React from "react";
import type { tileInfo } from "../Board/Board";
import { useState } from "react";
import { solve_state } from "../../services/servicesHandler";
import type {
  PuzzleRequest,
  operation_mode,
  heuristic,
} from "../../models/Dto_models";

type ControlPanelprops = {
  matrix: Array<tileInfo>;
  setMatrix: React.Dispatch<React.SetStateAction<Array<tileInfo>>>;
  run_algorithm: (states: Array<Array<Array<number>>>) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isSolving: boolean;
  currentStep: number;
  totalSteps: number;
  onSkipToEnd: () => void;
  onStop: () => void;
};

function ControlPanel({
  matrix,
  setMatrix,
  run_algorithm,
  speed,
  setSpeed,
  isSolving,
  currentStep,
  totalSteps,
  onSkipToEnd,
  onStop,
}: ControlPanelprops) {
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

  function handle_reset_click() {
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

  function handle_solve() {
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
        if (response == null || !response.steps) {
          alert("Could not solve: Either this state is unsolvable or backend returned an error.");
          return;
        } else {
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
        <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={handle_solve} disabled={isSolving}>
            {isSolving ? "Solving..." : "Solve"}
          </button>
          <button type="submit" onClick={handle_submit_click} disabled={isSolving}>
            change_state
          </button>
          <button type="reset" onClick={handle_reset_click}>
            Reset
          </button>

          {isSolving && (
            <>
              <button
                type="button"
                onClick={onSkipToEnd}
                style={{ backgroundColor: "#28a745", color: "white", fontWeight: "bold" }}
              >
                Skip to End
              </button>
              <button
                type="button"
                onClick={onStop}
                style={{ backgroundColor: "#dc3545", color: "white" }}
              >
                Stop
              </button>
            </>
          )}

          <select
            onChange={(e) => setAlgorithm(e.target.value as operation_mode)}
            required
            disabled={isSolving}
          >
            <option label="BFS" value={"BFS"}></option>
            <option label="DFS" value={"DFS"}></option>
            <option label="IDFS" value={"IDFS"}></option>
            <option label="A*" value={"A"}></option>
          </select>
          {algorithm == "A" && (
            <select
              value={heuristic_value}
              onChange={(e) => setheuristic_value(e.target.value as heuristic)}
              required
              disabled={isSolving}
            >
              <option value="manhattan">manhattan</option>
              <option value="euclidean">euclidean</option>
            </select>
          )}
        </div>

        {totalSteps > 0 && (
          <div style={{ marginTop: "10px", fontSize: "14px", color: "wheat" }}>
            Step: <strong>{currentStep}</strong> / <strong>{totalSteps}</strong>
          </div>
        )}

        <div
          style={{
            marginTop: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label htmlFor="speed-range">
              Speed: <strong>{speed}x</strong>
            </label>
            <input
              id="speed-range"
              type="range"
              min="1"
              max="100"
              step="1"
              value={Math.min(100, speed)}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: "160px" }}
            />
            <input
              type="number"
              min="1"
              max="1000"
              value={speed}
              onChange={(e) => setSpeed(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              style={{ width: "65px", padding: "2px 4px" }}
            />
            <span>x</span>
          </div>

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#ccc" }}>Presets:</span>
            {[1, 5, 20, 50, 100, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpeed(preset)}
                style={{
                  padding: "2px 6px",
                  fontSize: "12px",
                  backgroundColor: speed === preset ? "#4caf50" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {preset === 1000 ? "1000x Max" : `${preset}x`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ControlPanel;
