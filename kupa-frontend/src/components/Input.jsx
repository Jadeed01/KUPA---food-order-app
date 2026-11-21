import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Input({ label, type = "text", error, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-700">{label}</label>
      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <input
          type={isPassword && show ? "text" : type}
          {...props}
          className={`h-12 w-full rounded-xl border bg-neutral-50 px-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-kupa-600 focus:bg-white focus:ring-4 focus:ring-kupa-600/10 ${
            error ? "border-red-400" : "border-transparent"
          } ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-label={show ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={show ? "on" : "off"}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-1 text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}