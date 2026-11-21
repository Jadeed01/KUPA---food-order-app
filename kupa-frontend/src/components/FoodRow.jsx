import { motion } from "motion/react";
import FoodCard from "./FoodCard";
import { fadeUp, stagger } from "../lib/motion";

export default function FoodRow({ foods, onSelect }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2"
    >
      {foods.map((f) => (
        <motion.div key={f.id} variants={fadeUp} className="w-28 shrink-0 snap-start">
          <FoodCard food={f} onClick={onSelect} />
        </motion.div>
      ))}
    </motion.div>
  );
}