import { motion } from "motion/react";

export default function OtpBoxes({ value, length = 4, active = true }) {
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, i) => {
        const char = value[i];
        const isActive = active && value.length < length && i === value.length;
        return (
          <motion.div
            key={i}
            animate={char ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`relative flex h-14 w-14 items-center justify-center rounded-xl border text-xl font-semibold transition-colors ${
              isActive
                ? "border-kupa-600 bg-white ring-4 ring-kupa-600/10"
                : char
                ? "border-kupa-600/40 bg-kupa-50"
                : "border-transparent bg-neutral-50"
            }`}
          >
            {char ??
              (isActive && (
                <motion.span
                  className="h-6 w-0.5 bg-kupa-600"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
          </motion.div>
        );
      })}
    </div>
  );
}