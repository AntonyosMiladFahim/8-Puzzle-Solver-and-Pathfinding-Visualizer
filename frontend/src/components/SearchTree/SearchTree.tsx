import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import "./SearchTree.css";

interface SearchTreeProps {
  treeNodes?: Array<[string, number, string, number]>;
  solutionSteps?: Array<Array<Array<number>>>;
  currentStepIndex?: number;
  onSelectState?: (state: number[][]) => void;
  operationMode?: string;
}

interface LayoutNode {
  id: number;
  stateStr: string;
  parentIdx: number;
  move: string;
  val: number;
  depth: number;
  x: number;
  y: number;
}

export const SearchTree: React.FC<SearchTreeProps> = ({
  treeNodes,
  solutionSteps = [],
  currentStepIndex = 0,
  onSelectState,
  operationMode = "BFS",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(0.75);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 50 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoveredNode, setHoveredNode] = useState<LayoutNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [autoFocus, setAutoFocus] = useState<boolean>(true);
  const prevStepRef = useRef<number>(-1);

  const layoutNodes = useMemo<LayoutNode[]>(() => {
    if (!treeNodes || treeNodes.length === 0) return [];

    const nodes: LayoutNode[] = [];
    const childrenMap = new Map<number, number[]>();
    const depthCounts = new Map<number, number>();

    for (let i = 0; i < treeNodes.length; i++) {
      const [stateStr, parentIdx, move, val] = treeNodes[i];
      const parentNode =
        parentIdx >= 0 && parentIdx < nodes.length ? nodes[parentIdx] : null;
      const depth = parentNode ? parentNode.depth + 1 : 0;

      if (!childrenMap.has(parentIdx)) {
        childrenMap.set(parentIdx, []);
      }
      childrenMap.get(parentIdx)!.push(i);

      const countAtDepth = depthCounts.get(depth) || 0;
      depthCounts.set(depth, countAtDepth + 1);

      nodes.push({
        id: i,
        stateStr,
        parentIdx,
        move:
          (
            { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" } as Record<
              string,
              string
            >
          )[move] ??
          (move || "S"),
        val,
        depth,
        x: 0,
        y: depth * 95,
      });
    }

    const levelTrackers = new Map<number, number>();
    for (const node of nodes) {
      const count = depthCounts.get(node.depth) || 1;
      const order = levelTrackers.get(node.depth) || 0;
      levelTrackers.set(node.depth, order + 1);

      const spacing = Math.max(50, Math.min(95, 1400 / (count + 1)));
      node.x = (order - (count - 1) / 2) * spacing;
    }

    return nodes;
  }, [treeNodes]);

  // Map of solution nodes in exact sequence from root (index 0) to goal (index N)
  const { solutionPathNodes, solutionNodeIds, goalNodeId } = useMemo(() => {
    const pathNodes: LayoutNode[] = [];
    const ids = new Set<number>();
    let goalId: number | null = null;

    if (layoutNodes.length === 0) {
      return {
        solutionPathNodes: pathNodes,
        solutionNodeIds: ids,
        goalNodeId: goalId,
      };
    }

    const root = layoutNodes[0];
    pathNodes.push(root);
    ids.add(root.id);

    if (!solutionSteps || solutionSteps.length === 0) {
      return {
        solutionPathNodes: pathNodes,
        solutionNodeIds: ids,
        goalNodeId: goalId,
      };
    }

    // Index all layout nodes by stateStr for O(1) instant lookup
    const stateMap = new Map<string, LayoutNode[]>();
    for (let i = 0; i < layoutNodes.length; i++) {
      const n = layoutNodes[i];
      let list = stateMap.get(n.stateStr);
      if (!list) {
        list = [];
        stateMap.set(n.stateStr, list);
      }
      list.push(n);
    }

    let prevNode = root;
    for (let d = 0; d < solutionSteps.length; d++) {
      const targetStr = solutionSteps[d].flat().join("");
      const candidates = stateMap.get(targetStr);
      let match: LayoutNode | null = null;

      if (candidates && candidates.length > 0) {
        match =
          candidates.find((c) => c.parentIdx === prevNode.id) || candidates[0];
      }

      if (match) {
        pathNodes.push(match);
        ids.add(match.id);
        prevNode = match;
        if (d === solutionSteps.length - 1) {
          goalId = match.id;
        }
      }
    }

    return {
      solutionPathNodes: pathNodes,
      solutionNodeIds: ids,
      goalNodeId: goalId,
    };
  }, [solutionSteps, layoutNodes]);

  const isDfsMode = operationMode === "DFS" || operationMode === "IDFS";

  // Determine active node for currentStepIndex with 100% precision
  const activeNode = useMemo<LayoutNode | null>(() => {
    if (solutionPathNodes.length > 0) {
      const idx = Math.max(
        0,
        Math.min(solutionPathNodes.length - 1, currentStepIndex),
      );
      return solutionPathNodes[idx];
    }
    return layoutNodes[currentStepIndex] || layoutNodes[0] || null;
  }, [solutionPathNodes, layoutNodes, currentStepIndex]);

  // Track the active branch stack (path from root to currently active node)
  const activeBranchIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    let curr: LayoutNode | null = activeNode;
    while (curr) {
      ids.add(curr.id);
      if (curr.parentIdx >= 0 && curr.parentIdx < layoutNodes.length) {
        curr = layoutNodes[curr.parentIdx];
      } else {
        break;
      }
    }
    return ids;
  }, [activeNode, layoutNodes]);

  const drawTree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    ctx.translate(width / 2 + pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const radius = 13;
    const visibleMinY = (-pan.y - 120) / zoom;
    const visibleMaxY = (height - pan.y + 120) / zoom;
    const visibleMinX = (-width / 2 - pan.x - 120) / zoom;
    const visibleMaxX = (width / 2 - pan.x + 120) / zoom;

    const isFarZoom = zoom < 0.12;
    const isMediumZoom = zoom >= 0.12 && zoom < 0.35;

    // Draw edges
    for (let i = 0; i < layoutNodes.length; i++) {
      const node = layoutNodes[i];
      if (node.parentIdx >= 0 && node.parentIdx < layoutNodes.length) {
        const parent = layoutNodes[node.parentIdx];
        const isWinningEdge =
          solutionNodeIds.has(node.id) && solutionNodeIds.has(parent.id);
        const isActiveBranchEdge =
          activeBranchIds.has(node.id) && activeBranchIds.has(parent.id);
        const isBacktrackedEdge =
          isDfsMode &&
          activeNode &&
          node.id < activeNode.id &&
          !isActiveBranchEdge;

        if (isFarZoom && !isWinningEdge && !isActiveBranchEdge) {
          continue;
        }

        if (
          (node.y >= visibleMinY && node.y <= visibleMaxY) ||
          (parent.y >= visibleMinY && parent.y <= visibleMaxY)
        ) {
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(node.x, node.y);

          if (isDfsMode) {
            if (isActiveBranchEdge) {
              ctx.strokeStyle = "#E50914";
              ctx.lineWidth = isFarZoom ? 5 : 3.5;
              ctx.shadowColor = "rgba(229, 9, 20, 0.8)";
              ctx.shadowBlur = 8;
              ctx.setLineDash([]);
            } else if (isBacktrackedEdge) {
              ctx.strokeStyle = "rgba(180, 80, 80, 0.25)";
              ctx.lineWidth = 1.5;
              ctx.shadowBlur = 0;
              ctx.setLineDash([3, 3]);
            } else {
              ctx.strokeStyle = isMediumZoom
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(255, 255, 255, 0.06)";
              ctx.lineWidth = 1;
              ctx.shadowBlur = 0;
              ctx.setLineDash([]);
            }
          } else {
            const isEdgeActive =
              isWinningEdge && node.depth <= currentStepIndex;
            if (isEdgeActive) {
              ctx.strokeStyle = "#E50914";
              ctx.lineWidth = isFarZoom ? 5 : 3.5;
              ctx.shadowColor = "rgba(229, 9, 20, 0.8)";
              ctx.shadowBlur = 8;
            } else if (isWinningEdge) {
              ctx.strokeStyle = "rgba(229, 9, 20, 0.5)";
              ctx.lineWidth = isFarZoom ? 3 : 2;
              ctx.shadowBlur = 0;
            } else {
              ctx.strokeStyle = isMediumZoom
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(255, 255, 255, 0.08)";
              ctx.lineWidth = 1;
              ctx.shadowBlur = 0;
            }
            ctx.setLineDash([]);
          }

          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          if (operationMode === "A" && zoom > 0.8) {
            ctx.fillStyle = "#8C8C8C";
            ctx.font = "9px -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
              String(node.val.toPrecision(3)),
              (parent.x + node.x) / 2 + 8,
              (parent.y + node.y) / 2,
            );
          }
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < layoutNodes.length; i++) {
      const node = layoutNodes[i];
      if (
        node.x >= visibleMinX &&
        node.x <= visibleMaxX &&
        node.y >= visibleMinY &&
        node.y <= visibleMaxY
      ) {
        const isCurrent = activeNode?.id === node.id;
        const isSolutionPath = solutionNodeIds.has(node.id);
        const isGoal = goalNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isActiveBranch = isDfsMode && activeBranchIds.has(node.id);
        const isBacktrackedNode =
          isDfsMode && activeNode && node.id < activeNode.id && !isActiveBranch;
        const isCurrentLevel = !isDfsMode && node.depth === currentStepIndex;
        const isPastExplored = !isDfsMode && node.depth < currentStepIndex;

        if (
          isFarZoom &&
          !isSolutionPath &&
          !isCurrent &&
          !isGoal &&
          !isActiveBranch
        ) {
          ctx.fillStyle = isCurrentLevel
            ? "#444444"
            : isPastExplored || isBacktrackedNode
              ? "#222222"
              : "#141414";
          ctx.fillRect(node.x - 1.5, node.y - 1.5, 3, 3);
          continue;
        }

        ctx.beginPath();
        const r = isGoal
          ? radius + 5
          : isCurrent
            ? radius + 5
            : isSolutionPath || isActiveBranch
              ? radius + 2
              : radius;
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (isGoal && currentStepIndex >= node.depth) {
          ctx.fillStyle = "#E50914";
          ctx.strokeStyle = "#ffd700";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 16;
        } else if (isCurrent) {
          ctx.fillStyle = "#E50914";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3.5;
          ctx.shadowColor = "rgba(229, 9, 20, 1.0)";
          ctx.shadowBlur = 18;
        } else if (isDfsMode && isActiveBranch) {
          ctx.fillStyle = "#381414";
          ctx.strokeStyle = "#E50914";
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 0;
        } else if (isDfsMode && isBacktrackedNode) {
          ctx.fillStyle = "#181212";
          ctx.strokeStyle = "rgba(180, 70, 70, 0.35)";
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        } else if (
          !isDfsMode &&
          isSolutionPath &&
          node.depth <= currentStepIndex
        ) {
          ctx.fillStyle = "#381414";
          ctx.strokeStyle = "#E50914";
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 0;
        } else if (!isDfsMode && isSolutionPath) {
          ctx.fillStyle = "#222222";
          ctx.strokeStyle = "rgba(229, 9, 20, 0.5)";
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 0;
        } else if (!isDfsMode && isCurrentLevel) {
          ctx.fillStyle = "#262626";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 0;
        } else if (!isDfsMode && isPastExplored) {
          ctx.fillStyle = "#1a1a1a";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        } else if (isGoal) {
          ctx.fillStyle = "#1e1e1e";
          ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "#121212";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }

        if (isHovered) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
        }

        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radiant concentration beacon on currently traversing node
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 9, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(229, 9, 20, 0.75)";
          ctx.lineWidth = 2;
          ctx.stroke();

          if (zoom > 0.3) {
            ctx.fillStyle = "#ff4d4f";
            ctx.font = "bold 9px -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
              isDfsMode ? `▼ PROBING (D:${node.depth})` : "▼ EXPLORING",
              node.x,
              node.y - r - 8,
            );
          }
        }

        if (zoom > 0.25 || isCurrent || isGoal) {
          ctx.fillStyle =
            (isGoal && currentStepIndex >= node.depth) || isCurrent
              ? "#ffffff"
              : isSolutionPath || isActiveBranch
                ? "#ffcccc"
                : isCurrentLevel
                  ? "#dddddd"
                  : isBacktrackedNode
                    ? "#775555"
                    : "#777777";
          ctx.font = `bold ${isGoal ? 10 : isCurrent ? 11 : 10}px -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(isGoal ? "★" : node.move[0], node.x, node.y);
        }

        if (isGoal && zoom > 0.4) {
          ctx.fillStyle = "#ffd700";
          ctx.font = "bold 9px -apple-system, sans-serif";
          ctx.fillText("GOAL", node.x, node.y - r - 6);
        }
      }
    }

    ctx.restore();
  }, [
    layoutNodes,
    pan,
    zoom,
    activeNode,
    solutionNodeIds,
    goalNodeId,
    hoveredNode,
    operationMode,
    currentStepIndex,
    isDfsMode,
    activeBranchIds,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        drawTree();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawTree]);

  useEffect(() => {
    drawTree();
  }, [drawTree]);

  // Center camera on active node with pixel precision during step advances if autoFocus is true
  useEffect(() => {
    if (autoFocus && activeNode && prevStepRef.current !== currentStepIndex) {
      prevStepRef.current = currentStepIndex;
      const targetZoom = Math.max(0.85, Math.min(1.3, zoom));
      const canvas = canvasRef.current;
      const ch = canvas ? canvas.clientHeight : 480;

      const frameId = requestAnimationFrame(() => {
        setZoom(targetZoom);
        setPan({
          x: -activeNode.x * targetZoom,
          y: ch / 2 - activeNode.y * targetZoom,
        });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [currentStepIndex, autoFocus, activeNode, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setAutoFocus(false);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    const worldX = (mx - rect.width / 2 - pan.x) / zoom;
    const worldY = (my - pan.y) / zoom;

    let found: LayoutNode | null = null;
    if (zoom >= 0.2) {
      for (let i = layoutNodes.length - 1; i >= 0; i--) {
        const node = layoutNodes[i];
        if (
          node.x >= worldX - 22 &&
          node.x <= worldX + 22 &&
          node.y >= worldY - 22 &&
          node.y <= worldY + 22
        ) {
          const dist = Math.hypot(node.x - worldX, node.y - worldY);
          if (dist <= 18) {
            found = node;
            break;
          }
        }
      }
    }
    setHoveredNode(found);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAutoFocus(false);

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.2 : 0.83;
    const newZoom = Math.max(0.002, Math.min(5.0, zoom * factor));

    const newPanX =
      mx -
      canvas.width / 2 -
      (mx - canvas.width / 2 - pan.x) * (newZoom / zoom);
    const newPanY = my - (my - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const handleClick = () => {
    if (hoveredNode && onSelectState) {
      const s = hoveredNode.stateStr;
      const stateArr = [
        [Number(s[0]), Number(s[1]), Number(s[2])],
        [Number(s[3]), Number(s[4]), Number(s[5])],
        [Number(s[6]), Number(s[7]), Number(s[8])],
      ];
      onSelectState(stateArr);
    }
  };

  const fitTree = useCallback(() => {
    if (layoutNodes.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < layoutNodes.length; i++) {
      const n = layoutNodes[i];
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    const treeW = Math.max(100, maxX - minX + 100);
    const treeH = Math.max(100, maxY - minY + 120);
    const fitZoom = Math.max(
      0.002,
      Math.min(
        1.0,
        Math.min((canvas.width - 40) / treeW, (canvas.height - 60) / treeH),
      ),
    );
    setZoom(fitZoom);
    setPan({
      x: -((minX + maxX) / 2) * fitZoom,
      y: 45 - minY * fitZoom,
    });
    setAutoFocus(false);
  }, [layoutNodes]);

  const focusActive = useCallback(() => {
    if (!activeNode) return;
    const canvas = canvasRef.current;
    const ch = canvas ? canvas.clientHeight : 480;
    const targetZoom = Math.max(0.9, Math.min(1.4, zoom));
    setZoom(targetZoom);
    setPan({
      x: -activeNode.x * targetZoom,
      y: ch / 2 - activeNode.y * targetZoom,
    });
    setAutoFocus(true);
  }, [activeNode, zoom]);

  const zoomIn = () => {
    setAutoFocus(false);
    setZoom((z) => Math.min(5.0, z * 1.3));
  };

  const zoomOut = () => {
    setAutoFocus(false);
    setZoom((z) => Math.max(0.002, z * 0.75));
  };

  const resetView = () => {
    setZoom(0.75);
    setPan({ x: 0, y: 50 });
    setAutoFocus(true);
  };

  return (
    <div className="searchTreeContainer" ref={containerRef}>
      <div className="treeControls">
        <div className="treeControlsLeft">
          <span className="treeBadge">
            {operationMode} Tree ({layoutNodes.length.toLocaleString()} nodes)
          </span>
          {activeNode && (
            <span className="treeLevelBadge">
              {isDfsMode
                ? `Depth ${activeNode.depth} · Active Stack: ${activeBranchIds.size} ${goalNodeId === activeNode.id ? "★ Goal Reached!" : "(Probing & Backtracking)"}`
                : `Level ${activeNode.depth}${solutionSteps.length > 0 ? ` / ${solutionSteps.length}` : ""} ${goalNodeId === activeNode.id ? "★ Goal Reached!" : "(Exploring Level)"}`}
            </span>
          )}
        </div>
        <div className="treeControlsRight">
          <button
            type="button"
            className={`treeBtn ${autoFocus ? "active" : ""}`}
            onClick={() => setAutoFocus(!autoFocus)}
            title="Toggle camera auto-follow during playback"
          >
            {autoFocus ? "● Follow ON" : "○ Free Pan"}
          </button>
          <button
            type="button"
            className="treeBtn"
            onClick={focusActive}
            title="Focus current active node"
          >
            Focus
          </button>
          <button
            type="button"
            className="treeBtn"
            onClick={fitTree}
            title="Fit full tree in view"
          >
            Fit All
          </button>
          <button
            type="button"
            className="treeBtn iconBtn"
            onClick={zoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            className="treeBtn iconBtn"
            onClick={zoomOut}
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            className="treeBtn"
            onClick={resetView}
            title="Reset camera"
          >
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={`treeCanvas ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {hoveredNode && (
        <div
          className="treeTooltip"
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y - 70}px`,
          }}
        >
          <div className="tooltipHeader">
            <span>Level (Depth): {hoveredNode.depth}</span>
            <span>
              {solutionNodeIds.has(hoveredNode.id)
                ? "★ Correct Path"
                : `Move: ${hoveredNode.move}`}
            </span>
          </div>
          <div className="tooltipGrid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const val = Number(hoveredNode.stateStr[i]);
              return (
                <div
                  key={i}
                  className={`tooltipCell ${val === 0 ? "blank" : ""} ${val === i && val !== 0 ? "goal" : ""}`}
                >
                  {val !== 0 ? val : ""}
                </div>
              );
            })}
          </div>
          <div className="tooltipFooter">
            <span>Node #{hoveredNode.id + 1}</span>
            <span>Val: {hoveredNode.val}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTree;
