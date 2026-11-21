import { AnimatePresence, motion } from "motion/react";

export default function Message({ type = "error", children }) {
  return (
    <AnimatePresence>
      {children ? (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div
            className={`rounded-xl px-4 py-3 text-xs font-medium ${
              type === "error" ? "bg-red-50 text-red-600" : "bg-kupa-50 text-kupa-700"
            }`}
          >
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}