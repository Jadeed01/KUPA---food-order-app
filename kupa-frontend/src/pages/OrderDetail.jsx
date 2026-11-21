import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { PiXCircleFill } from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import BackHeader from "../components/BackHeader";
import FoodImage from "../components/FoodImage";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import Message from "../components/Message";
import api, { getError } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { fadeUp, stagger } from "../lib/motion";
import { STATUS_STEPS, paymentLabel, statusStyle } from "../lib/orderStatus";

function Tracker({ status }) {
  const current = STATUS_STEPS.findIndex((s) => s.key === status);
  const delivered = status === "delivered";

  return (
    <ol>
      {STATUS_STEPS.map((s, i) => {
        const done = i < current || delivered;
        const active = i === current && !delivered;
        const reached = done || active;

        return (
          <li key={s.key} className="relative flex items-center gap-3 pb-6 last:pb-0">
            {i < STATUS_STEPS.length - 1 && (
              <span className="absolute bottom-0 left-[11px] top-6 w-0.5 bg-neutral-200">
                <motion.span
                  className="block h-full w-full origin-top bg-kupa-600"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: done ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                />
              </span>
            )}

            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                reached ? "border-kupa-600 bg-kupa-600 text-white" : "border-neutral-200 bg-white"
              }`}
            >
              {done && <FiCheck size={12} strokeWidth={3} />}
              {active && (
                <>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-kupa-600"
                    animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                </>
              )}
            </motion.span>

            <div>
              <p className={`text-sm ${reached ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>{s.label}</p>
              {active && <p className="text-[11px] text-kupa-600">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Line({ label, value, bold = false }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : "text-sm text-neutral-600"}`}>
      <span>{label}</span>
      <span className={bold ? "text-kupa-600" : ""}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}/`);
      setOrder(data);
      setError("");
    } catch (err) {
      setError(getError(err, "Couldn't load this order."));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // live tracking: refresh every 15s until the order is finished
  useEffect(() => {
    if (!order || ["delivered", "cancelled"].includes(order.status)) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [order, load]);

  const cancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const { data } = await api.post(`/orders/${id}/cancel/`);
      setOrder(data);
    } catch (err) {
      setError(getError(err, "Couldn't cancel this order."));
    } finally {
      setCancelling(false);
    }
  };

  if (!order) {
    return (
      <PageTransition className="overflow-y-auto px-5 pt-5">
        <BackHeader title="Order" onBack={() => navigate("/orders")} />
        {error ? (
          <div className="space-y-3 pt-16 text-center">
            <p className="text-sm text-neutral-500">{error}</p>
            <div className="mx-auto w-32">
              <Button variant="soft" onClick={load}>
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        )}
      </PageTransition>
    );
  }

  const cancelled = order.status === "cancelled";

  return (
    <PageTransition className="overflow-y-auto pb-8">
      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-5">
        <motion.div variants={fadeUp}>
          <BackHeader title={order.code} onBack={() => navigate("/orders")} />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-5 flex items-center justify-between">
          <p className="text-xs text-neutral-400">{formatDate(order.created_at)}</p>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[order.status]}`}>
            {order.status_display}
          </span>
        </motion.div>

        {/* tracking */}
        <motion.div variants={fadeUp} className="mt-4 rounded-2xl bg-neutral-50 p-5">
          {cancelled ? (
            <div className="flex items-center gap-3 text-red-600">
              <PiXCircleFill size={28} />
              <div>
                <p className="text-sm font-semibold">Order cancelled</p>
                <p className="text-xs text-red-500/80">This order won't be delivered.</p>
              </div>
            </div>
          ) : (
            <Tracker status={order.status} />
          )}
        </motion.div>

        {/* items */}
        <motion.h2 variants={fadeUp} className="mt-6 text-sm font-semibold">
          Items
        </motion.h2>
        <motion.ul variants={fadeUp} className="mt-3 space-y-3">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center gap-3">
              <FoodImage src={it.image} alt={it.name} className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.name}</p>
                {it.options.length > 0 && (
                  <p className="truncate text-[11px] text-neutral-400">{it.options.map((o) => o.name).join(", ")}</p>
                )}
                <p className="text-xs text-neutral-500">
                  {it.quantity} x {formatPrice(it.unit_price)}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(it.line_total)}</span>
            </li>
          ))}
        </motion.ul>

        {/* delivery info */}
        <motion.div variants={fadeUp} className="mt-6 space-y-2.5 rounded-2xl bg-neutral-50 p-4 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-neutral-400">Delivery ({order.delivery_label || "Address"})</span>
            <span className="text-right font-medium">{order.delivery_address}</span>
          </div>
          {order.delivery_phone && (
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Phone</span>
              <span className="font-medium">{order.delivery_phone}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-neutral-400">Payment</span>
            <span className="font-medium">{paymentLabel[order.payment_method]}</span>
          </div>
          {order.note && (
            <div className="flex justify-between gap-4">
              <span className="text-neutral-400">Note</span>
              <span className="text-right font-medium">{order.note}</span>
            </div>
          )}
        </motion.div>

        {/* totals */}
        <motion.div variants={fadeUp} className="mt-4 space-y-2 rounded-2xl bg-neutral-50 p-4">
          <Line label="Subtotal" value={formatPrice(order.subtotal)} />
          <Line label="Delivery fee" value={formatPrice(order.delivery_fee)} />
          <div className="my-1 h-px bg-neutral-200" />
          <Line label="Total" value={formatPrice(order.total)} bold />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-4">
          <Message>{error}</Message>
        </motion.div>

        {order.status === "pending" && (
          <motion.div variants={fadeUp} className="mt-4">
            <Button variant="outline" onClick={cancel} loading={cancelling}>
              Cancel Order
            </Button>
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}