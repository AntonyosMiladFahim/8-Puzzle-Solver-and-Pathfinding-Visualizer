import { useState, useRef } from "react";
import "./Board.css";
import Tile from "../Tiles/Tile";
import ControlPanel from "../ControlPanel/ControlPanel";
import ExploredNodes from "../ExploredNodes/ExploredNodes";
import type { Response } from "../../models/Dto_models";

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
  const [exploredNodes, setExploredNodes] = useState<Record<string, number> | null>(null);

  const speedRef = useRef<number>(1);
  const isRunningRef = useRef<boolean>(false);
  const skipToEndRef = useRef<boolean>(false);
  const runIdRef = useRef<number>(0);

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

  function run_algorithm(
    states: Array<Array<Array<number>>>,
    response?: Response | null,
  ) {
    if (response?.explored_nodes) {
      setExploredNodes(response.explored_nodes);
    }
    solve_puzzle(states);
  }

  const handleSelectExploredState = (stateArray: number[][]) => {
    handleStop();
    const flat = stateArray.flat();
    setMatrix(flat.map((val, idx) => ({ value: val, index: idx })));
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const solve_puzzle = async (Steps: Array<Array<Array<number>>>) => {
    const runId = ++runIdRef.current;
    isRunningRef.current = true;
    skipToEndRef.current = false;
    setIsSolving(true);

    const states: Array<Array<number>> = Steps.map((array) => {
      return array.flat();
    });

    setTotalSteps(states.length);
    setCurrentStep(0);

    let currentIndex = 0;

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

      {/* Right side: Explored Nodes Component */}
      <div className="rightColumn">
        <ExploredNodes
          exploredNodes={exploredNodes}
          onSelectState={handleSelectExploredState}
        />
      </div>
    </div>
  );
}

export default Board;
