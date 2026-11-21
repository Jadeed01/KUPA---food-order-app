import { motion } from "motion/react";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import DeliveryCard from "../components/DeliveryCard";
import FoodImage from "../components/FoodImage";
import FoodRow from "../components/FoodRow";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import { useAddresses } from "../context/AddressContext";
import { useMenu } from "../context/MenuContext";
import { useProductSheet } from "../context/ProductSheetContext";
import { fadeUp, stagger } from "../lib/motion";
import { formatPrice } from "../lib/format";

export default function Home() {
  const navigate = useNavigate();
  const { foods, loading, error, reload } = useMenu();
  const { defaultAddress } = useAddresses();
  const { open } = useProductSheet();

  const promo = foods.find((f) => f.is_featured);
  const top = foods.filter((f) => f.is_top_of_week);
  const showSkeleton = loading && !foods.length;

  return (
    <PageTransition fade className="overflow-y-auto pb-24">
      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-5">
        <motion.div variants={fadeUp}>
          <PageHeader title="Home" />
        </motion.div>

        <motion.button
          variants={fadeUp}
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/menu", { state: { focusSearch: true } })}
          className="mt-5 flex h-12 w-full items-center gap-3 rounded-xl bg-neutral-50 px-4 text-sm text-neutral-400"
        >
          <FiSearch size={18} />
          Search on Kupa
        </motion.button>

        <motion.div variants={fadeUp} className="mt-4">
          <DeliveryCard address={defaultAddress} onClick={() => navigate("/location")} />
        </motion.div>

        {error && !foods.length && (
          <motion.div variants={fadeUp} className="mt-8 space-y-3 text-center">
            <p className="text-sm text-neutral-500">{error}</p>
            <div className="mx-auto w-32">
              <Button variant="soft" onClick={reload}>
                Try again
              </Button>
            </div>
          </motion.div>
        )}

        {showSkeleton && <Skeleton className="mt-4 h-36" />}
        {promo && (
          <motion.div
            variants={fadeUp}
            className="relative mt-4 flex items-center justify-between overflow-hidden rounded-2xl bg-kupa-50 p-4"
          >
            <span className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-kupa-100" />
            <div className="relative z-10 max-w-[55%]">
              <p className="text-base font-bold leading-tight">{promo.name}</p>
              <p className="mt-1 text-xs text-neutral-500">Today's special · {formatPrice(promo.price)}</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                onClick={() => open(promo)}
                className="mt-3 rounded-lg bg-kupa-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Order Now
              </motion.button>
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <FoodImage src={promo.image} alt={promo.name} className="h-28 w-28 rounded-full shadow-lg ring-4 ring-white" />
            </motion.div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Top of Week</h2>
          <Link to="/menu" className="text-xs font-semibold text-kupa-600">
            See all
          </Link>
        </motion.div>

        {showSkeleton ? (
          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-28 shrink-0 space-y-2">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <FoodRow foods={top} onSelect={open} />
        )}
      </motion.div>
    </PageTransition>
  );
}