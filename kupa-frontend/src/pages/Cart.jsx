import { useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { FiCreditCard, FiDollarSign, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { PiShoppingCart } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import DeliveryCard from "../components/DeliveryCard";
import FoodImage from "../components/FoodImage";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import { useAddresses } from "../context/AddressContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api, { getError } from "../lib/api";
import { formatPrice } from "../lib/format";

const PAYMENTS = [
  { id: "cash", name: "Cash on delivery", Icon: FiDollarSign },
  { id: "card", name: "Card", Icon: FiCreditCard },
];

function Row({ label, value, bold = false }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : "text-neutral-600"}`}>
      <span>{label}</span>
      <motion.span key={value} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={bold ? "text-kupa-600" : ""}>
        {value}
      </motion.span>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateQuantity, removeItem, refresh } = useCart();
  const { defaultAddress } = useAddresses();
  const shake = useAnimationControls();

  const [busy, setBusy] = useState(null);
  const [payment, setPayment] = useState("cash");
  const [phone, setPhone] = useState(user?.phone || "");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const items = cart.items;

  const run = async (itemId, fn) => {
    setBusy(itemId);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(null);
    }
  };

  const placeOrder = async () => {
    setError("");
    if (!defaultAddress) {
      setError("Add a delivery address first.");
      shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post("/orders/", {
        address_id: defaultAddress.id,
        payment_method: payment,
        phone: phone.trim(),
        note: note.trim(),
      });
      await refresh();
      navigate("/order-success", { replace: true, state: { order: data } });
    } catch (err) {
      setError(getError(err, "Couldn't place your order."));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageTransition fade className="overflow-y-auto pb-28">
      <div className="px-5 pt-5">
        <PageHeader title="My Cart" />

        <motion.div animate={shake} className="mt-5">
          <DeliveryCard address={defaultAddress} onClick={() => navigate("/location", { state: { from: "/cart" } })} />
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="text-kupa-200"
            >
              <PiShoppingCart size={72} />
            </motion.div>
            <p className="mt-4 text-sm font-semibold">Your cart is empty</p>
            <p className="mt-1 text-xs text-neutral-400">Add something tasty from the menu.</p>
            <div className="mt-5 w-40">
              <Button onClick={() => navigate("/menu")}>Browse menu</Button>
            </div>
          </motion.div>
        ) : (
          <>
            <h2 className="mt-6 text-sm font-semibold">Your Order ({items.length})</h2>

            <ul className="mt-3 space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3"
                  >
                    <FoodImage src={item.food.image} alt={item.food.name} className="h-16 w-16 shrink-0 rounded-xl" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.food.name}</p>
                      {item.options.length > 0 && (
                        <p className="truncate text-[11px] text-neutral-400">
                          {item.options.map((o) => o.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.85 }}
                          disabled={busy === item.id || item.quantity <= 1}
                          onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity - 1))}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={12} />
                        </motion.button>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={item.quantity}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="w-4 text-center text-xs font-semibold"
                          >
                            {item.quantity}
                          </motion.span>
                        </AnimatePresence>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.85 }}
                          disabled={busy === item.id || item.quantity >= 50}
                          onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-kupa-600 text-white disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={12} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <motion.span
                        key={item.line_total}
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-sm font-semibold text-kupa-600"
                      >
                        {formatPrice(item.line_total)}
                      </motion.span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        disabled={busy === item.id}
                        onClick={() => run(item.id, () => removeItem(item.id))}
                        className="p-1 text-neutral-400 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <h3 className="mt-6 text-xs font-medium text-neutral-700">Payment</h3>
            <div className="mt-2 flex gap-2">
              {PAYMENTS.map(({ id, name, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPayment(id)}
                  className={`relative flex flex-1 items-center justify-center rounded-xl py-2.5 text-xs font-medium transition-colors ${
                    payment === id ? "text-white" : "bg-neutral-50 text-neutral-500"
                  }`}
                >
                  {payment === id && (
                    <motion.span
                      layoutId="pay-pill"
                      className="absolute inset-0 rounded-xl bg-kupa-600"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon size={14} />
                    {name}
                  </span>
                </button>
              ))}
            </div>
            {payment === "card" && (
              <p className="mt-2 text-[11px] text-neutral-400">Card payments are simulated. Nothing is charged.</p>
            )}

            <div className="mt-5 space-y-3">
              <Input label="Phone number" type="tel" placeholder="So the courier can reach you" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Note (optional)" placeholder="e.g. no onions" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            </div>

            <div className="mt-6 space-y-2 rounded-2xl bg-neutral-50 p-4 text-sm">
              <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
              <Row label="Delivery fee" value={formatPrice(cart.delivery_fee)} />
              <div className="my-1 h-px bg-neutral-200" />
              <Row label="Total" value={formatPrice(cart.total)} bold />
            </div>

            <div className="mt-4">
              <Message>{error}</Message>
            </div>

            <div className="mt-4">
              <Button onClick={placeOrder} loading={placing}>
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}