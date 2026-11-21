import { motion } from "motion/react";

export default function Logo({ size = 48, color = "currentColor", animated = false }) {
  const steam = (d, delay) => (
    <motion.path
      d={d}
      animate={animated ? { opacity: [0, 1, 0], y: [4, -2, -6] } : { opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    />
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {steam("M16 15c-2-3 2-5 0-9", 0)}
      {steam("M24 15c-2-3 2-5 0-9", 0.4)}
      {steam("M32 15c-2-3 2-5 0-9", 0.8)}
      <path d="M6 24h36c0 10-8 18-18 18S6 34 6 24z" fill={color} fillOpacity="0.18" />
      <path d="M4 24h40" />
    </svg>
  );
}