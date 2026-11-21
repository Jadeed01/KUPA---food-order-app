import { motion } from "motion/react";
import { FiChevronRight, FiMapPin } from "react-icons/fi";
import Skeleton from "./Skeleton";

const labelName = (l) => (l === "other" ? "Others" : l.charAt(0).toUpperCase() + l.slice(1));

export default function DeliveryCard({ address, onClick }) {
  if (address === undefined) return <Skeleton className="h-[76px]" />;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-kupa-600 p-4 text-left text-white"
    >
      <motion.span
        className="absolute -bottom-12 -right-10 h-32 w-32 rounded-full border-[18px] border-white/10"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <FiMapPin size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {address ? `Delivery to ${labelName(address.label)}` : "Add delivery address"}
          </p>
          <p className="mt-0.5 max-w-[190px] truncate text-xs text-white/70">
            {address ? address.full_address : "Tell us where to deliver"}
          </p>
        </div>
      </div>
      <span className="relative flex items-center gap-1 text-xs text-white/80">
        {address ? "Change" : ""}
        <FiChevronRight size={18} />
      </span>
    </motion.button>
  );
}