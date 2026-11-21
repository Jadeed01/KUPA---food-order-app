import { motion } from "motion/react";
import { FiBell } from "react-icons/fi";

export default function PageHeader({ title, bell = true }) {
  return (
    <div className="grid grid-cols-3 items-center">
      <span />
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-base font-semibold"
      >
        {title}
      </motion.h1>
      <div className="flex justify-end">
        {bell && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 text-neutral-700"
            aria-label="Notifications"
          >
            <motion.span
              className="origin-top"
              animate={{ rotate: [0, 14, -12, 8, -6, 0] }}
              transition={{ duration: 0.9, delay: 0.8, repeat: Infinity, repeatDelay: 6 }}
            >
              <FiBell size={18} />
            </motion.span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </motion.button>
        )}
      </div>
    </div>
  );
}