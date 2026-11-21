import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => navigate(user ? "/home" : "/onboarding", { replace: true }), 2400);
    return () => clearTimeout(t);
  }, [loading, user, navigate]);

  return (
    <motion.div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-kupa-600 text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-40 w-40 rounded-full border border-white/20"
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
      >
        <Logo size={76} color="#fff" animated />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-4 text-3xl font-bold tracking-tight"
      >
        Kupa
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-1 text-sm text-white/70"
      >
        Your favorite foods, delivered
      </motion.p>
    </motion.div>
  );
}