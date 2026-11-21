import { useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Confetti from "../components/Confetti";
import Button from "../components/Button";
import { formatPrice } from "../lib/format";
import { paymentLabel } from "../lib/orderStatus";

function Line({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  useEffect(() => {
    if (!order) navigate("/orders", { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  return (
    <PageTransition className="flex flex-col px-6 pb-8">
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <Confetti />

        <div className="relative flex h-32 w-32 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-kupa-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          />
          <svg width="120" height="120" viewBox="0 0 120 120" className="relative">
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#2f7a50"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <motion.path
              d="M38 62l15 15 30-32"
              fill="none"
              stroke="#2f7a50"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            />
          </svg>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-2xl font-bold tracking-tight"
        >
          Order placed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-2 max-w-[250px] text-sm text-neutral-500"
        >
          We've got your order. The kitchen will start on it soon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 }}
          className="mt-6 w-full space-y-2.5 rounded-2xl bg-neutral-50 p-4"
        >
          <Line label="Order number" value={order.code} />
          <Line label="Total" value={formatPrice(order.total)} />
          <Line label="Payment" value={paymentLabel[order.payment_method]} />
          <Line label="Delivering to" value={order.delivery_address} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="space-y-3"
      >
        <Button onClick={() => navigate(`/orders/${order.id}`, { replace: true })}>Track Order</Button>
        <Button variant="soft" onClick={() => navigate("/menu", { replace: true })}>
          Back to Menu
        </Button>
      </motion.div>
    </PageTransition>
  );
}