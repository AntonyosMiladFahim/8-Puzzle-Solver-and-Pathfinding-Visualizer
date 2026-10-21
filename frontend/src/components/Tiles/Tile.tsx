import "./Tile.css";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";

type MatrixGridProps = {
  val: number;
  index: number;
  speed?: number;
};

function Tile({ val, index, speed = 1 }: MatrixGridProps) {
  // At speeds > 5x, disable spring physics to prevent lag during fast-forward
  const transition: Transition =
    speed > 5
      ? { duration: 0 }
      : { type: "spring", stiffness: 200, damping: 20 };

  return (
    <motion.div
      layout
      transition={transition}
      className={`number ${val === index ? "correct" : ""} ${val === 0 ? "disabled" : ""}`}
      style={{
        opacity: val == 0 ? 0 : 1,
        left: (index % 3) * 100,
        top: Math.floor(index / 3) * 100,
        zIndex: val == 0 ? 0 : 10,
      }}
    >
      {val != 0 && val}
    </motion.div>
  );
}

export default Tile;
