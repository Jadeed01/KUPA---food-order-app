import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { Check, Heart, Minus, Plus } from "lucide-react";
import FoodImage from "./FoodImage";
import Button from "./Button";
import { useCart } from "../context/CartContext";
import { getError } from "../lib/api";
import { formatExtra, formatPrice } from "../lib/format";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

// required single-choice groups (like Sauce) start with the first option selected
const initialSelection = (food) =>
  Object.fromEntries(
    food.option_groups.map((g) => [
      g.id,
      g.is_required && g.max_select === 1 && g.options[0] ? [g.options[0].id] : [],
    ])
  );

function Checkbox({ checked }) {
  return (
    <motion.span
      animate={{
        backgroundColor: checked ? "#2f7a50" : "#ffffff",
        borderColor: checked ? "#2f7a50" : "#d4d4d4",
      }}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2"
    >
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="text-white"
          >
            <FiCheck size={13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

export default function ProductSheet({ food, isFavorite, onFavorite, onClose }) {
  const { addItem } = useCart();
  const dragControls = useDragControls();

  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState(() => initialSelection(food));
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [error, setError] = useState("");
  const [limitGroup, setLimitGroup] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (group, opt) => {
    setError("");
    const cur = picked[group.id] || [];

    if (group.max_select === 1) {
      if (cur[0] === opt.id && !group.is_required) setPicked({ ...picked, [group.id]: [] });
      else setPicked({ ...picked, [group.id]: [opt.id] });
      return;
    }
    if (cur.includes(opt.id)) {
      setPicked({ ...picked, [group.id]: cur.filter((i) => i !== opt.id) });
      return;
    }
    if (cur.length >= group.max_select) {
      setLimitGroup(group.id);
      setTimeout(() => setLimitGroup(null), 500);
      return;
    }
    setPicked({ ...picked, [group.id]: [...cur, opt.id] });
  };

  const extras = food.option_groups
    .flatMap((g) => g.options.filter((o) => (picked[g.id] || []).includes(o.id)))
    .reduce((sum, o) => sum + Number(o.extra_price), 0);
  const total = (Number(food.price) + extras) * qty;

  const missing = food.option_groups.find((g) => g.is_required && !(picked[g.id] || []).length);

  const add = async () => {
    if (status !== "idle") return;
    if (missing) {
      setError(`Please choose an option for "${missing.name}"`);
      return;
    }
    setStatus("loading");
    try {
      await addItem(food.id, qty, Object.values(picked).flat());
      setStatus("done");
      setTimeout(onClose, 800);
    } catch (err) {
      setError(getError(err, "Couldn't add to cart."));
      setStatus("idle");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative flex max-h-[90%] flex-col rounded-t-[28px] bg-white shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
      >
        {/* drag handle */}
        <div
          className="flex cursor-grab touch-none justify-center pb-2 pt-3"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <span className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
            <FoodImage src={food.image} alt={food.name} className="h-48 w-full rounded-2xl" />
          </motion.div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold leading-tight">{food.name}</h2>
              <p className="mt-0.5 text-xs text-neutral-400">{food.cuisine || food.category_name}</p>
            </div>
            <motion.button
              type="button"
              onClick={onFavorite}
              whileTap={{ scale: 0.8 }}
              aria-label="Favorite"
              className="p-1"
            >
              <motion.span
                key={String(isFavorite)}
                initial={{ scale: 0.6 }}
                animate={{ scale: isFavorite ? [0.6, 1.4, 1] : 1 }}
                className="block"
              >
                {isFavorite ? (
                  <FaHeart size={22} className="text-red-500" />
                ) : (
                  <FaRegHeart size={22} className="text-neutral-300" />
                )}
              </motion.span>
            </motion.button>
          </div>

          {food.description && <p className="mt-2 text-xs leading-relaxed text-neutral-500">{food.description}</p>}

          {/* quantity + price */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </motion.button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={qty}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="w-5 text-center text-sm font-semibold"
                >
                  {qty}
                </motion.span>
              </AnimatePresence>
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setQty((q) => Math.min(50, q + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-kupa-600 text-white"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} />
              </motion.button>
            </div>
            <motion.span
              key={total}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-base font-bold text-kupa-600"
            >
              {formatPrice(total)}
            </motion.span>
          </div>

          {/* option groups */}
          {food.option_groups.map((g) => {
            const sel = picked[g.id] || [];
            return (
              <motion.section
                key={g.id}
                className="mt-5"
                animate={limitGroup === g.id ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold">{g.name}</h3>
                  <span className="text-[11px] text-neutral-400">
                    {g.is_required ? "Required · " : ""}
                    {g.max_select === 1 ? "Choose 1" : `Up to ${g.max_select}`}
                  </span>
                </div>
                <div className="mt-1">
                  {g.options.map((o) => (
                    <motion.button
                      key={o.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(g, o)}
                      className="flex w-full items-center gap-3 border-b border-neutral-100 py-3 text-left last:border-0"
                    >
                      <Checkbox checked={sel.includes(o.id)} />
                      <span className="flex-1 text-sm text-neutral-700">{o.name}</span>
                      <span className="text-sm text-neutral-500">{formatExtra(o.extra_price)}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* footer */}
        <div className="border-t border-neutral-100 px-5 pb-6 pt-3">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden text-center text-xs text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <Button onClick={add} loading={status === "loading"}>
            {status === "done" ? (
              <>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                  <FiCheck size={13} strokeWidth={3} />
                </motion.span>
                Added to cart
              </>
            ) : (
              `Add to Cart (${formatPrice(total)})`
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}