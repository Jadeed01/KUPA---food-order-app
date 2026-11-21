import { motion } from "motion/react";

export default function PageTransition({ children, className = "", fade = false }) {
  const x = fade ? 0 : 24;
  return (
    <motion.div
      className={`h-full ${className}`}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -x }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}