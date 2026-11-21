import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { PiReceipt } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import BackHeader from "../components/BackHeader";
import FoodImage from "../components/FoodImage";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import api, { getError } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";
import { fadeUp, stagger } from "../lib/motion";
import { statusStyle } from "../lib/orderStatus";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/");
      setOrders(data);
      setError("");
    } catch (err) {
      setError(getError(err, "Couldn't load your orders."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageTransition className="overflow-y-auto pb-8">
      <div className="px-5 pt-5">
        <BackHeader title="My Orders" onBack={() => navigate("/profile")} />

        {error && !orders ? (
          <div className="space-y-3 pt-16 text-center">
            <p className="text-sm text-neutral-500">{error}</p>
            <div className="mx-auto w-32">
              <Button variant="soft" onClick={load}>
                Try again
              </Button>
            </div>
          </div>
        ) : orders === null ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-20 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="text-kupa-200"
            >
              <PiReceipt size={72} />
            </motion.div>
            <p className="mt-4 text-sm font-semibold">No orders yet</p>
            <p className="mt-1 text-xs text-neutral-400">Your past orders will show up here.</p>
            <div className="mt-5 w-40">
              <Button onClick={() => navigate("/menu")}>Browse menu</Button>
            </div>
          </motion.div>
        ) : (
          <motion.ul variants={stagger} initial="hidden" animate="show" className="mt-6 space-y-3">
            {orders.map((o) => {
              const count = o.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <motion.li key={o.id} variants={fadeUp}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/orders/${o.id}`)}
                    className="w-full rounded-2xl border border-neutral-100 bg-white p-4 text-left shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{o.code}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[o.status]}`}>
                        {o.status_display}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400">{formatDate(o.created_at)}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <FoodImage src={o.items[0]?.image} alt={o.items[0]?.name ?? ""} className="h-12 w-12 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {o.items[0]?.name}
                          {o.items.length > 1 && ` +${o.items.length - 1} more`}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {count} {count === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-kupa-600">{formatPrice(o.total)}</span>
                    </div>
                  </motion.button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </PageTransition>
  );
}