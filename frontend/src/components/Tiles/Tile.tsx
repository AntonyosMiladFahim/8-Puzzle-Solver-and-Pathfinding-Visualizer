import "./Tile.css";
import { motion } from "framer-motion";
type MatrixGridProps = {
  val: number;
  index: number;
};

function Tile({ val, index }: MatrixGridProps) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
