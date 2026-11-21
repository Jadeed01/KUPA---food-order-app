import { motion } from "motion/react";
import FoodImage from "./FoodImage";
import { formatPrice } from "../lib/format";

export default function FoodCard({ food, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(food)}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -3 }}
      className="group block w-full text-left"
    >
      <FoodImage src={food.image} alt={food.name} className="aspect-square w-full rounded-2xl" />
      <p className="mt-2 truncate text-xs font-medium text-neutral-800">{food.name}</p>
      <p className="text-sm font-semibold text-kupa-600">{formatPrice(food.price)}</p>
    </motion.button>
  );
}