import { AnimatePresence, motion } from "motion/react";

const styles = {
  primary: "bg-kupa-600 text-white hover:bg-kupa-700 disabled:bg-kupa-600/60",
  soft: "bg-kupa-50 text-kupa-700 hover:bg-kupa-100",
  outline: "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      {...props}
      disabled={loading || disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}