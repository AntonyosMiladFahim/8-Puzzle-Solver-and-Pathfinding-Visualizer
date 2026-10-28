import { useState, useRef } from "react";
import "./Board.css";
import Tile from "../Tiles/Tile";
import ControlPanel from "../ControlPanel/ControlPanel";
import ExploredNodes from "../ExploredNodes/ExploredNodes";
import SearchTree from "../SearchTree/SearchTree";
import type { Response, operation_mode } from "../../models/Dto_models";

export interface tileInfo {
  value: number;
  index: number;
}

function Board() {
  const len = 9;

  const generate_array = () => {
    return new Array<tileInfo>(len)
      .fill({ value: 0, index: 0 })
      .map((_, i) => i)
      .sort(() => Math.random() - 0.5)
      .map((x, i) => ({ value: x, index: i }));
  };

  const [matrix, setMatrix] = useState<Array<tileInfo>>(generate_array());
  const [speed, setSpeed] = useState<number>(1);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [solutionSteps, setSolutionSteps] = useState<Array<Array<Array<number>>>>([]);
  const [exploredNodes, setExploredNodes] = useState<Record<string, number> | null>(null);
  const [treeNodes, setTreeNodes] = useState<Array<[string, number, string, number]> | null>(null);
  const [operationMode, setOperationMode] = useState<operation_mode>("BFS");
  const [activeRightTab, setActiveRightTab] = useState<"tree" | "nodes">("tree");
  const [moves, setMoves] = useState<Array<{ move: string; stepNumber: number }>>([]);

  const speedRef = useRef<number>(1);
  const isRunningRef = useRef<boolean>(false);
  const skipToEndRef = useRef<boolean>(false);
  const runIdRef = useRef<number>(0);

  const [initialMatrix, setInitialMatrix] = useState<Array<tileInfo>>(matrix);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
  };

  const handleSkipToEnd = () => {
    skipToEndRef.current = true;
  };

  const handleStop = () => {
    isRunningRef.current = false;
    setIsSolving(false);
  };

  const handleContinue = () => {
    if (solutionSteps.length === 0 || isSolving) return;
    const startIndex = currentStep >= totalSteps ? 0 : currentStep;
    solve_puzzle(solutionSteps, startIndex);
  };

  const handleStepForward = () => {
    if (solutionSteps.length === 0) return;
    handleStop();
    const nextIdx = Math.min(solutionSteps.length - 1, currentStep);
    const state = solutionSteps[nextIdx].flat();
    setMatrix(state.map((val, idx) => ({ value: val, index: idx })));
    setCurrentStep(nextIdx + 1);
  };

  const handleStepBackward = () => {
    if (solutionSteps.length === 0 || currentStep <= 0) return;
    handleStop();
    if (currentStep === 1) {
      setMatrix(initialMatrix);
      setCurrentStep(0);
    } else {
      const prevIdx = currentStep - 2;
      const state = solutionSteps[prevIdx].flat();
      setMatrix(state.map((val, idx) => ({ value: val, index: idx })));
      setCurrentStep(prevIdx + 1);
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    handleStop();
    if (solutionSteps.length > 0) {
      const idx = Math.min(solutionSteps.length - 1, Math.max(0, stepNumber));
      const state = solutionSteps[idx].flat();
      setMatrix(state.map((val, i) => ({ value: val, index: i })));
      setCurrentStep(idx);
    }
  };

  function run_algorithm(
    states: Array<Array<Array<number>>>,
    response?: Response | null,
    mode?: operation_mode,
  ) {
    setInitialMatrix(matrix);
    setSolutionSteps(states);
    if (response?.explored_nodes) {
      setExploredNodes(response.explored_nodes);
    }
    // Depth limit >= 20 check: do not visualize search tree if depth / steps >= 20
    if (response?.tree_nodes && states.length <= 20) {
      setTreeNodes(response.tree_nodes);
    } else {
      setTreeNodes(null);
    }
    if (mode) {
      setOperationMode(mode);
    }
    // Extract move sequence from response.steps
    if (response?.steps && response.steps.length > 1) {
      const recordedMoves = response.steps.slice(1).map((s, idx) => ({
        move: s.move,
        stepNumber: idx + 1,
      }));
      setMoves(recordedMoves);
    }
    solve_puzzle(states, 0);
  }

  const handleSelectExploredState = (stateArray: number[][]) => {
    handleStop();
    const flat = stateArray.flat();
    setMatrix(flat.map((val, idx) => ({ value: val, index: idx })));
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const solve_puzzle = async (
    Steps: Array<Array<Array<number>>>,
    startIndex: number = 0,
  ) => {
    const runId = ++runIdRef.current;
    isRunningRef.current = true;
    skipToEndRef.current = false;
    setIsSolving(true);

    const states: Array<Array<number>> = Steps.map((array) => {
      return array.flat();
    });

    setTotalSteps(states.length);
    setCurrentStep(startIndex);

    let currentIndex = startIndex;

    while (currentIndex < states.length) {
      if (runIdRef.current !== runId || !isRunningRef.current) {
        break;
      }

      if (skipToEndRef.current) {
        const lastState = states[states.length - 1];
        const newMatrix: Array<tileInfo> = lastState.map((number, index) => ({
          value: number,
          index: index,
        }));
        setMatrix(newMatrix);
        setCurrentStep(states.length);
        break;
      }

      const currentSpeed = speedRef.current;

      if (currentSpeed <= 60) {
        const state = states[currentIndex];
        const newMatrix: Array<tileInfo> = state.map((number, index) => ({
          value: number,
          index: index,
        }));
        setMatrix(newMatrix);
        setCurrentStep(currentIndex + 1);

        const stepDelay = Math.max(10, Math.round(1000 / currentSpeed));
        await delay(stepDelay);
        currentIndex++;
      } else {
        const stepsPerFrame = Math.max(1, Math.round(currentSpeed / 60));
        currentIndex = Math.min(states.length - 1, currentIndex + stepsPerFrame);

        const state = states[currentIndex];
        const newMatrix: Array<tileInfo> = state.map((number, index) => ({
          value: number,
          index: index,
        }));
        setMatrix(newMatrix);
        setCurrentStep(currentIndex + 1);

        await delay(16);
        if (currentIndex >= states.length - 1) {
          break;
        }
      }
    }

    if (runIdRef.current === runId) {
      setIsSolving(false);
      isRunningRef.current = false;
      skipToEndRef.current = false;
    }
  };

  return (
    <div className="appLayout">
      {/* Left side: Control Panel on top, Visualized State (Board) under it */}
      <div className="leftColumn">
        <ControlPanel
          setMatrix={(val) => {
            handleStop();
            setMatrix(val);
          }}
          matrix={matrix}
          run_algorithm={run_algorithm}
          speed={speed}
          setSpeed={handleSpeedChange}
          isSolving={isSolving}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onSkipToEnd={handleSkipToEnd}
          onStop={handleStop}
          onContinue={handleContinue}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          moves={moves}
          onJumpToStep={handleJumpToStep}
          onResetMoves={() => setMoves([])}
        />
        <div className="boardCard">
          <div className="boardCardHeader">
            <span className="boardCardTitle">Visualized State</span>
            <span className="boardCardBadge">3×3 Grid</span>
          </div>
          <div className="Board">
            {matrix.map((tileInfo) => (
              <Tile
                key={tileInfo.value}
                val={tileInfo.value}
                index={tileInfo.index}
                speed={speed}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Search Tree & Explored Nodes */}
      <div className="rightColumn">
        <div className="tabGroup">
          <button
            type="button"
            className={`tabBtn ${activeRightTab === "tree" ? "active" : ""}`}
            onClick={() => setActiveRightTab("tree")}
          >
            Search Tree {treeNodes ? `(${treeNodes.length})` : ""}
          </button>
          <button
            type="button"
            className={`tabBtn ${activeRightTab === "nodes" ? "active" : ""}`}
            onClick={() => setActiveRightTab("nodes")}
          >
            Explored Nodes {exploredNodes ? `(${Object.keys(exploredNodes).length})` : ""}
          </button>
        </div>

        {activeRightTab === "tree" ? (
          <SearchTree
            treeNodes={treeNodes || undefined}
            solutionSteps={solutionSteps}
            currentStepIndex={currentStep}
            onSelectState={handleSelectExploredState}
            operationMode={operationMode}
          />
        ) : (
          <ExploredNodes
            exploredNodes={exploredNodes}
            onSelectState={handleSelectExploredState}
          />
        )}
      </div>
    </div>
  );
}

export default Board;
