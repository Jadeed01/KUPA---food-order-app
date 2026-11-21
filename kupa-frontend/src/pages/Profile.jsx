import { motion } from "motion/react";
import { FiChevronRight, FiMapPin, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { fadeUp, stagger } from "../lib/motion";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.full_name || user?.email || "?").charAt(0).toUpperCase();

  const rows = [
    { label: "My Orders", Icon: FiShoppingBag, onClick: () => navigate("/orders") },
    { label: "Saved Addresses", Icon: FiMapPin, onClick: () => navigate("/location", { state: { from: "/profile" } }) },
  ];

  return (
    <PageTransition fade className="overflow-y-auto pb-24">
      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-5">
        <motion.div variants={fadeUp}>
          <PageHeader title="Profile" bell={false} />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-kupa-600 text-4xl font-bold text-white shadow-lg ring-8 ring-kupa-50"
          >
            {initial}
          </motion.div>
          <h2 className="mt-4 text-lg font-bold">{user?.full_name || "Kupa user"}</h2>
          <p className="text-sm text-neutral-500">{user?.email}</p>
          <span className="mt-3 rounded-full bg-kupa-50 px-3 py-1 text-[11px] font-semibold capitalize text-kupa-700">
            {user?.role}
          </span>
        </motion.div>

        <motion.ul variants={fadeUp} className="mt-8 space-y-2">
          {rows.map(({ label, Icon, onClick }) => (
            <li key={label}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 p-3.5 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kupa-100 text-kupa-700">
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <FiChevronRight size={18} className="text-neutral-400" />
              </motion.button>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeUp} className="mt-8">
          <Button
            variant="soft"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </Button>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}