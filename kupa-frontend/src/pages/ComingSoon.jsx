import { motion } from "motion/react";
import { FiTool } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";

export default function ComingSoon({ title, Icon = FiTool }) {
  const navigate = useNavigate();
  return (
    <PageTransition fade className="flex flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-kupa-600"
      >
        <Icon size={56} />
      </motion.div>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm text-neutral-500">This screen is coming in the next phase.</p>
      <div className="mt-2 w-36">
        <Button variant="soft" onClick={() => navigate("/home")}>
          Back home
        </Button>
      </div>
    </PageTransition>
  );
}