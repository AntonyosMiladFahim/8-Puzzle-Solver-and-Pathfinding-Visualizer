import React, { useState, useMemo } from "react";
import "./ExploredNodes.css";

interface ExploredNodesProps {
  exploredNodes: Record<string, number> | null;
  onSelectState?: (state: number[][]) => void;
}

const PAGE_SIZE = 12;

export const ExploredNodes: React.FC<ExploredNodesProps> = ({
  exploredNodes,
  onSelectState,
}) => {
  const [page, setPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFeedback, setSearchFeedback] = useState<{
    searched: boolean;
    found: boolean;
    cost?: number;
    state?: number[][];
    nodeNumber?: number;
    matchingKey?: string;
  } | null>(null);

  // Memoize keys so 60k keys are only extracted when exploredNodes changes
  const keys = useMemo(() => {
    if (!exploredNodes) return [];
    return Object.keys(exploredNodes);
  }, [exploredNodes]);

  const totalCount = keys.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Current page items (only parse 12 items at a time for zero lag)
  const currentItems = useMemo(() => {
    if (!exploredNodes) return [];
    const start = page * PAGE_SIZE;
    return keys.slice(start, start + PAGE_SIZE).map((key, idx) => {
      let state: number[][] = [];
      try {
        state = JSON.parse(key);
      } catch {
        state = [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ];
      }
      return {
        index: start + idx + 1,
        key,
        state,
        cost: exploredNodes[key],
      };
    });
  }, [keys, exploredNodes, page]);

  const handleSearch = () => {
    const clean = searchQuery.replace(/\D/g, "");
    if (clean.length !== 9) {
      alert("Please enter exactly 9 digits (0 to 8) to search.");
      return;
    }
    const state: number[][] = [
      [Number(clean[0]), Number(clean[1]), Number(clean[2])],
      [Number(clean[3]), Number(clean[4]), Number(clean[5])],
      [Number(clean[6]), Number(clean[7]), Number(clean[8])],
    ];

    if (!exploredNodes || totalCount === 0) {
      setSearchFeedback({ searched: true, found: false, state });
      return;
    }

    // Python json.dumps uses space after commas: [[1, 2, 3], [4, 0, 5], [6, 7, 8]]
    const pythonKey = `[[${state[0].join(", ")}], [${state[1].join(", ")}], [${state[2].join(", ")}]]`;
    // Standard JS JSON stringify without spaces: [[1,2,3],[4,0,5],[6,7,8]]
    const jsKey = JSON.stringify(state);

    let cost: number | undefined = undefined;
    let matchingKey: string | undefined = undefined;

    if (exploredNodes[pythonKey] !== undefined) {
      cost = exploredNodes[pythonKey];
      matchingKey = pythonKey;
    } else if (exploredNodes[jsKey] !== undefined) {
      cost = exploredNodes[jsKey];
      matchingKey = jsKey;
    } else {
      // Fallback: check matching stripped whitespace
      const compactTarget = jsKey.replace(/\s+/g, "");
      const foundEntryKey = keys.find(
        (k) => k.replace(/\s+/g, "") === compactTarget
      );
      if (foundEntryKey !== undefined) {
        cost = exploredNodes[foundEntryKey];
        matchingKey = foundEntryKey;
      }
    }

    if (cost !== undefined && matchingKey !== undefined) {
      const foundIndex = keys.indexOf(matchingKey);
      if (foundIndex !== -1) {
        setPage(Math.floor(foundIndex / PAGE_SIZE));
      }
      setSearchFeedback({
        searched: true,
        found: true,
        cost,
        state,
        matchingKey,
        nodeNumber: foundIndex !== -1 ? foundIndex + 1 : undefined,
      });
    } else {
      setSearchFeedback({
        searched: true,
        found: false,
        state,
      });
    }
  };

  return (
    <div className="exploredPanel">
      <div className="exploredHeader">
        <div>
          <h3 className="exploredTitle">Explored Nodes</h3>
          <p className="exploredSubtitle">State space search traversal</p>
        </div>
        {totalCount > 0 && (
          <span className="countBadge">
            {totalCount.toLocaleString()} explored
          </span>
        )}
      </div>

      {!exploredNodes || totalCount === 0 ? (
        <div className="exploredEmpty">
          <div className="emptyIcon">🔍</div>
          <p className="emptyText">
            No explored nodes yet. Run an algorithm from the control panel to view the explored state space.
          </p>
        </div>
      ) : (
        <>
          {/* Quick search in explored set */}
          <div className="searchBox">
            <input
              type="text"
              placeholder="Search 9 digits (e.g. 120345678)"
              maxLength={9}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.replace(/[^0-8]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="searchInput"
            />
            <button type="button" onClick={handleSearch} className="searchBtn">
              Search
            </button>
          </div>

          {searchFeedback?.searched && (
            <div
              className={`searchResult ${searchFeedback.found ? "found" : "notFound"}`}
            >
              <div className="searchResultText">
                <strong>
                  {searchFeedback.found
                    ? `✓ State Explored at Node #${searchFeedback.nodeNumber?.toLocaleString()}`
                    : "✗ State Was Not Explored"}
                </strong>
                {searchFeedback.found && (
                  <span className="searchResultCost">
                    Evaluation Value: {searchFeedback.cost}
                  </span>
                )}
              </div>
              {searchFeedback.found && searchFeedback.state && onSelectState && (
                <button
                  type="button"
                  className="viewStateBtn"
                  onClick={() => onSelectState(searchFeedback.state!)}
                >
                  View on Board
                </button>
              )}
            </div>
          )}

          {/* Paginated grid of explored nodes */}
          <div className="nodesGrid">
            {currentItems.map((item) => {
              const isMatch = searchFeedback?.found && searchFeedback.matchingKey === item.key;
              return (
                <div
                  key={item.key}
                  className={`nodeCard ${isMatch ? "matched" : ""}`}
                  onClick={() => onSelectState && onSelectState(item.state)}
                  title="Click to view state on board"
                >
                  <div className="nodeMeta">
                    <span className="nodeIndex">#{item.index.toLocaleString()}</span>
                    <span className="nodeVal">Val: {item.cost.toPrecision(3)}</span>
                  </div>
                  <div className="miniGrid">
                    {item.state.flat().map((num, i) => (
                      <div
                        key={i}
                        className={`miniCell ${num === 0 ? "blank" : ""} ${num === i && num !== 0 ? "goal" : ""}`}
                      >
                        {num !== 0 ? num : ""}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          <div className="pagination">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="pageBtn"
            >
              ‹ Previous
            </button>
            <span className="pageText">
              Page <strong>{page + 1}</strong> of <strong>{totalPages.toLocaleString()}</strong>
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="pageBtn"
            >
              Next ›
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExploredNodes;
