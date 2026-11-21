import { motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BackHeader({ title, onBack }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 items-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 text-neutral-700"
        aria-label="Go back"
      >
        <FiArrowLeft size={18} />
      </motion.button>
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center text-base font-semibold">
        {title}
      </motion.h1>
      <span />
    </div>
  );
}