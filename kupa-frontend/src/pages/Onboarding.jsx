import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Logo from "../components/Logo";
import Button from "../components/Button";
import {
  PiBowlFoodFill,
  PiCarrotFill,
  PiCookieFill,
  PiFishFill,
  PiHamburgerFill,
  PiMapPinFill,
  PiMotorcycleFill,
  PiPackageFill,
} from "react-icons/pi";

const slides = [
  {
    title: "All your\nfavorites foods",
    text: "Order your favorite menu with easy, on demand delivery.",
    Icon: PiBowlFoodFill,
    bubbles: [
      { Icon: PiCarrotFill, top: "6%", left: "-4%", color: "text-orange-500" },
      { Icon: PiFishFill, top: "72%", left: "-2%", color: "text-sky-500" },
      { Icon: PiCookieFill, top: "4%", left: "80%", color: "text-amber-600" },
    ],
  },
  {
    title: "Get delivery at\nyour doorstep",
    text: "Your ready order will be delivered quickly by our courier.",
    Icon: PiMotorcycleFill,
    bubbles: [
      { Icon: PiPackageFill, top: "8%", left: "-4%", color: "text-amber-600" },
      { Icon: PiHamburgerFill, top: "70%", left: "82%", color: "text-orange-500" },
      { Icon: PiMapPinFill, top: "4%", left: "80%", color: "text-red-500" },
    ],
  },
];

const variants = {
  enter: (d) => ({ x: d * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d * -60, opacity: 0 }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [[i, dir], setPage] = useState([0, 1]);
  const slide = slides[i];
  const last = i === slides.length - 1;

  const next = () => (last ? navigate("/signup") : setPage([i + 1, 1]));

  return (
    <PageTransition className="flex flex-col px-6 pb-8 pt-8">
      <div className="flex items-center justify-center gap-2 text-kupa-700">
        <Logo size={22} color="#2f7a50" />
        <span className="text-sm font-semibold">Kupa</span>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={i}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 && !last) setPage([i + 1, 1]);
              if (info.offset.x > 60 && i > 0) setPage([i - 1, -1]);
            }}
            className="text-center"
          >
            <div className="relative mx-auto h-64 w-64">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
                transition={{
                  scale: { type: "spring", stiffness: 160, damping: 14 },
                  opacity: { duration: 0.3 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-b from-kupa-50 to-kupa-100 text-kupa-600 shadow-xl ring-8 ring-white"
              >
                <slide.Icon size={110} />
              </motion.div>

              {slide.bubbles.map((b, idx) => (
                <motion.div
                  key={idx}
                  className={`absolute flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ${b.color}`}
                  style={{ top: b.top, left: b.left }}
                  animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3 + idx, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 }}
                >
                  <b.Icon size={24} />
                </motion.div>
              ))}
            </div>

            <h1 className="mt-10 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight">
              {slide.title}
            </h1>
            <p className="mx-auto mt-2 max-w-[260px] text-sm text-neutral-500">{slide.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mb-6 flex justify-center gap-1.5">
        {slides.map((_, idx) => (
          <motion.span
            key={idx}
            className="h-1.5 rounded-full"
            animate={{ width: idx === i ? 20 : 6, backgroundColor: idx === i ? "#2f7a50" : "#d4d4d4" }}
          />
        ))}
      </div>

      <div className="space-y-3">
        <Button onClick={next}>{last ? "Get Started" : "Continue"}</Button>
        <Button variant="soft" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      </div>
    </PageTransition>
  );
}