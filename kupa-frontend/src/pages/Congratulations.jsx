import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Confetti from "../components/Confetti";
import Button from "../components/Button";
import { PiGiftFill, PiSparkleFill } from "react-icons/pi";

export default function Congratulations() {
  const navigate = useNavigate();

  return (
    <PageTransition className="flex flex-col px-6 pb-8">
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <Confetti />

        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, -6, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="text-kupa-600"
            >
              <PiGiftFill size={96} />
            </motion.div>
          </motion.div>

          {["-top-2 -left-6", "top-2 -right-6", "-bottom-1 -left-4"].map((pos, i) => (
            <motion.span
              key={i}
              className={`absolute text-amber-400 ${pos}`}
              animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4], rotate: [0, 20, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
            >
              <PiSparkleFill size={24} />
            </motion.span>
          ))}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-2xl font-bold tracking-tight"
        >
          Congratulation!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-2 max-w-[240px] text-sm text-neutral-500"
        >
          Your account is complete, please enjoy the best menu from us.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
        <Button onClick={() => navigate("/home", { replace: true })}>Get Started</Button>
      </motion.div>
    </PageTransition>
  );
}