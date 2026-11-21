import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiHome, FiShoppingCart, FiUser } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";


const tabs = [
  { to: "/home", label: "Home", Icon: FiHome },
  { to: "/menu", label: "Menu", Icon: MdRestaurantMenu },
  { to: "/cart", label: "Cart", Icon: FiShoppingCart },
  { to: "/profile", label: "Profile", Icon: FiUser },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { cart } = useCart();
  const visible = tabs.some((t) => t.to === pathname);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="absolute inset-x-0 bottom-0 z-40 border-t border-neutral-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
        >
          <ul className="flex items-center justify-around">
            {tabs.map(({ to, label, Icon }) => {
              const active = pathname === to;
              return (
                <li key={to}>
                  <Link to={to} className="flex w-16 flex-col items-center gap-0.5 py-1">
                    <motion.span whileTap={{ scale: 0.85 }} className="relative flex h-9 w-12 items-center justify-center">
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-kupa-50"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <motion.span
                        animate={{ y: active ? -1 : 0, scale: active ? 1.1 : 1 }}
                        className={`relative ${active ? "text-kupa-600" : "text-neutral-400"}`}
                      >
                        <Icon size={20} />
                      </motion.span>
                      {to === "/cart" && cart.item_count > 0 && (
                        <motion.span
                          key={cart.item_count}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
                        >
                          {cart.item_count}
                        </motion.span>
                      )}
                    </motion.span>
                    <span className={`text-[10px] font-medium ${active ? "text-kupa-600" : "text-neutral-400"}`}>
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}