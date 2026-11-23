import type React from "react";
import type { tileInfo } from "../Board/Board";
import { useState, useMemo } from "react";
import { solve_state } from "../../services/servicesHandler";
import type {
  PuzzleRequest,
  operation_mode,
  heuristic,
  Response,
} from "../../models/Dto_models";
import "./ControlPanel.css";

type ControlPanelprops = {
  matrix: Array<tileInfo>;
  setMatrix: React.Dispatch<React.SetStateAction<Array<tileInfo>>>;
  run_algorithm: (
    states: Array<Array<Array<number>>>,
    response?: Response | null,
    operationMode?: operation_mode,
  ) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isSolving: boolean;
  currentStep: number;
  totalSteps: number;
  onSkipToEnd: () => void;
  onStop: () => void;
  onContinue?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  moves?: Array<{ move: string; stepNumber: number }>;
  onJumpToStep?: (stepNumber: number) => void;
  onResetMoves?: () => void;
};

interface SolutionStats {
  cost: number | null;
  time_taken: number | null;
  exploredCount: number | null;
}

function computeInversionInfo(digits: string): {
  valid: boolean;
  inversions: number;
  solvable: boolean;
} {
  if (digits.length !== 9) {
    return { valid: false, inversions: 0, solvable: false };
  }
  const set = new Set(digits);
  if (set.size !== 9) {
    return { valid: false, inversions: 0, solvable: false };
  }
  for (let i = 0; i < 9; i++) {
    if (!set.has(i.toString())) {
      return { valid: false, inversions: 0, solvable: false };
    }
  }

  // Count inversions excluding 0 (blank tile)
  const nums = digits
    .split("")
    .map(Number)
    .filter((n) => n !== 0);
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) {
        inversions++;
      }
    }
  }

  return {
    valid: true,
    inversions,
    solvable: inversions % 2 === 0,
  };
}

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
  onContinue,
  onStepForward,
  onStepBackward,
  moves = [],
  onJumpToStep,
  onResetMoves,
}: ControlPanelprops) {
  const [newState, setnewState] = useState<string>("012345678");
  const [heuristic_value, setheuristic_value] =
    useState<heuristic>("manhattan");
  const [algorithm, setAlgorithm] = useState<operation_mode>("BFS");
  const [solutionStats, setSolutionStats] = useState<SolutionStats | null>(
    null,
  );
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Real-time inversion calculation
  const inversionInfo = useMemo(
    () => computeInversionInfo(newState),
    [newState],
  );
  // handles the correctness of the state before trying to solve it
  function handle_submit_click(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(event.currentTarget);
    if (newState.length !== 9) {
      return;
    }
    const character_set: Set<string> = new Set();

    for (const c of newState) {
      character_set.add(c);
    }

    if (character_set.size === 9) {
      onResetMoves?.();
      const updated: Array<tileInfo> = [...newState].map((c, index) => {
        const t: tileInfo = { value: Number.parseInt(c, 10), index: index };
        return t;
      });

      setMatrix(updated);
    }
  }

  function handle_reset_click() {
    onResetMoves?.();
    let initial_state = "";
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
      const t: tileInfo = { value: Number.parseInt(c, 10), index: i };
      return t;
    });
    setnewState(initial_state);
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

    const puzzleRequest: PuzzleRequest = {
      state: request_array,
      operation_mode: algorithm,
      heuristic: heuristic_value,
    };
    setIsCalculating(true);
    solve_state(puzzleRequest)
      .then((response) => {
        if (response == null || !response.steps) {
          alert(
            "Could not solve: Either this state is unsolvable or backend returned an error.",
          );
          return;
        } else {
          const exploredCount = response.explored_nodes
            ? Object.keys(response.explored_nodes).length
            : 0;
          setSolutionStats({
            cost: response.cost,
            time_taken: response.time_taken,
            exploredCount,
          });

          const resullt = Array.from(response.steps.map((s) => s.state));
          run_algorithm(resullt, response, algorithm);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setIsCalculating(false);
      });
  }

  return (
    <div className="controlPanel">
      <div className="header">AI Lab 1 - 8 Puzzle</div>

      <div className="input">
        <label>
          Enter the order of numbers you want
          <input type="text" value={newState} onChange={handle_onchange} />
        </label>

        {/* Inversion Counter & Solvability Feedback */}
        <div className="inversionStatus">
          {inversionInfo.valid ? (
            <span
              className={`inversionBadge ${inversionInfo.solvable ? "solvable" : "unsolvable"}`}
            >
              Inversions: <strong>{inversionInfo.inversions}</strong> —{" "}
              {inversionInfo.solvable
                ? "Solvable ✓"
                : "Unsolvable ⚠️ (Odd inversions)"}
            </span>
          ) : (
            <span className="inversionBadge invalid">
              Enter 9 unique digits (0–8)
            </span>
          )}
        </div>

        <div className="button-group">
          <button
            className="btn-solve"
            onClick={handle_solve}
            disabled={isSolving || isCalculating}
          >
            {isCalculating
              ? "Calculating..."
              : isSolving
                ? "Solving..."
                : "Solve"}
          </button>
          <button
            type="submit"
            onClick={handle_submit_click}
            disabled={isSolving || isCalculating}
          >
            change_state
          </button>
          <button
            type="reset"
            onClick={handle_reset_click}
            disabled={isCalculating}
          >
            Shuffle
          </button>

          {isSolving ? (
            <>
              <button type="button" className="btn-skip" onClick={onSkipToEnd}>
                Skip to End
              </button>
              <button type="button" className="btn-stop" onClick={onStop}>
                Stop
              </button>
            </>
          ) : (
            totalSteps > 0 && (
              <button
                type="button"
                className="btn-continue"
                onClick={onContinue}
                title="Continue visualization"
              >
                Continue ▶
              </button>
            )
          )}

          <select
            className="select-algo"
            onChange={(e) => setAlgorithm(e.target.value as operation_mode)}
            required
            disabled={isSolving || isCalculating}
            value={algorithm}
          >
            <option label="BFS" value={"BFS"}></option>
            <option label="DFS" value={"DFS"}></option>
            <option label="IDFS" value={"IDFS"}></option>
            <option label="A*" value={"A"}></option>
          </select>
          {algorithm === "A" && (
            <select
              className="select-heuristic"
              value={heuristic_value}
              onChange={(e) => setheuristic_value(e.target.value as heuristic)}
              required
              disabled={isSolving || isCalculating}
            >
              <option value="manhattan">manhattan</option>
              <option value="euclidean">euclidean</option>
            </select>
          )}
        </div>

        {totalSteps > 0 && (
          <div className="steps-row">
            <div className="steps-counter">
              Step: <strong>{currentStep.toLocaleString()}</strong> /{" "}
              <strong>{totalSteps.toLocaleString()}</strong>
            </div>
            <div className="step-nav-buttons">
              <button
                type="button"
                className="btn-step"
                onClick={onStepBackward}
                disabled={currentStep <= 0}
                title="Step Backward"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                className="btn-step"
                onClick={onStepForward}
                disabled={currentStep >= totalSteps}
                title="Step Forward"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        {solutionStats && (
          <div className="solution-stats">
            <span className="stat-badge">
              Cost: <strong>{solutionStats.cost ?? totalSteps}</strong>
            </span>
            <span className="stat-badge">
              Explored Nodes:{" "}
              <strong>{solutionStats.exploredCount?.toLocaleString()}</strong>
            </span>
            <span className="stat-badge">
              Time:{" "}
              <strong>
                {solutionStats.time_taken != null
                  ? solutionStats.time_taken < 1
                    ? `${(solutionStats.time_taken * 1000).toFixed(1)} ms`
                    : `${solutionStats.time_taken.toFixed(3)} s`
                  : "—"}
              </strong>
            </span>
          </div>
        )}

        <div className="speed-section">
          <div className="speed-row">
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
              className="speed-slider"
            />
            <input
              type="number"
              min="1"
              max="1000"
              value={speed}
              onChange={(e) =>
                setSpeed(
                  Math.max(1, Math.min(1000, Number(e.target.value) || 1)),
                )
              }
              className="speed-input"
            />
            <span>x</span>
          </div>

          <div className="presets-row">
            <span className="presets-label">Presets:</span>
            {[1, 5, 20, 50, 100, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpeed(preset)}
                className={`preset-btn ${speed === preset ? "active" : ""}`}
              >
                {preset === 1000 ? "1000x Max" : `${preset}x`}
              </button>
            ))}
          </div>
        </div>

        <div className="moves-section">
          <div className="moves-header">
            <span className="moves-title">
              Sequence of Moves {moves.length > 0 ? `(${moves.length})` : ""}
            </span>
            {moves.length > 0 && currentStep > 0 && (
              <span className="current-move-badge">
                Step {currentStep} / {moves.length}
                {moves[currentStep - 1]
                  ? ` • ${moves[currentStep - 1].move}`
                  : ""}
              </span>
            )}
          </div>

          {moves.length > 0 ? (
            <div className="moves-scroll-container">
              {moves.map((item, idx) => {
                const isActive = currentStep === item.stepNumber;
                const isPassed = currentStep > item.stepNumber;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`move-pill ${isActive ? "active" : ""} ${isPassed ? "passed" : ""}`}
                    onClick={() => onJumpToStep?.(item.stepNumber)}
                    title={`Jump to Move #${item.stepNumber}: ${item.move}`}
                  >
                    <span className="move-num">#{item.stepNumber}</span>
                    <span className="move-arrow">
                      {item.move === "UP" && "↑"}
                      {item.move === "DOWN" && "↓"}
                      {item.move === "LEFT" && "←"}
                      {item.move === "RIGHT" && "→"}
                    </span>
                    <span className="move-dir">{item.move}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="moves-empty">
              No moves recorded yet. Select an algorithm and click Solve to
              generate the move sequence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
