import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import PageTransition from "./PageTransition";
import { fadeUp, stagger } from "../lib/motion";
import { FiArrowLeft } from "react-icons/fi";

export default function AuthLayout({ title, subtitle, children, back = true }) {
  const navigate = useNavigate();

  return (
    <PageTransition className="overflow-y-auto">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex min-h-full flex-col px-6 pb-8 pt-6"
      >
        {back && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.85, x: -3 }}
            className="-ml-2 mb-6 flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100"
            aria-label="Go back"
          >
            <FiArrowLeft size={22} />
          </motion.button>
        )}
        <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={fadeUp} className="mt-1 text-sm text-neutral-500">
            {subtitle}
          </motion.p>
        )}
        <div className="mt-8 flex flex-1 flex-col">{children}</div>
      </motion.div>
    </PageTransition>
  );
}