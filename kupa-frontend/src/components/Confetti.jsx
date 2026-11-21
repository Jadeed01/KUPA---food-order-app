import { useMemo } from "react";
import { motion } from "motion/react";

const COLORS = ["#2f7a50", "#f5b700", "#ff6b6b", "#4dabf7", "#b197fc"];

export default function Confetti({ count = 30 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 90 + Math.random() * 110;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40,
          rot: Math.random() * 540 - 270,
          color: COLORS[i % COLORS.length],
          size: 6 + Math.random() * 6,
          delay: Math.random() * 0.15,
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.5, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 120], opacity: [1, 1, 0], rotate: p.rot, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.4 + p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}