import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PiForkKnife } from "react-icons/pi";
import { useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import FoodCard from "../components/FoodCard";
import FoodRow from "../components/FoodRow";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import { useMenu } from "../context/MenuContext";
import { useProductSheet } from "../context/ProductSheetContext";
import { FiSearch, FiX } from "react-icons/fi";

export default function Menu() {
  const { foods, categories, loading, error, reload } = useMenu();
  const { open } = useProductSheet();
  const { state } = useLocation();
  const searchRef = useRef(null);

  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (state?.focusSearch) searchRef.current?.focus();
  }, [state]);

  useEffect(() => {
    document.getElementById(`tab-${tab}`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [tab]);

  const tabs = useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "featured", label: "Featured" },
      { id: "top", label: "Top of Week" },
      ...categories.map((c) => ({ id: `cat-${c.id}`, label: c.name })),
    ],
    [categories]
  );

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      foods.filter((f) => {
        if (tab === "featured" && !f.is_featured) return false;
        if (tab === "top" && !f.is_top_of_week) return false;
        if (tab.startsWith("cat-") && `cat-${f.category}` !== tab) return false;
        if (q && !`${f.name} ${f.cuisine} ${f.category_name}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    [foods, tab, q]
  );

  const top = useMemo(() => foods.filter((f) => f.is_top_of_week), [foods]);
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, items: foods.filter((f) => f.category === c.id) }))
        .filter((s) => s.items.length),
    [categories, foods]
  );

  const showSections = tab === "all" && !q;

  return (
    <PageTransition fade className="overflow-y-auto pb-24">
      <div className="px-5 pt-5">
        <PageHeader title="Menu" />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5">
          <p className="text-xs text-neutral-400">Our Food</p>
          <h2 className="text-2xl font-bold tracking-tight text-kupa-600">Special For You</h2>
        </motion.div>

        {/* search */}
        <div className="relative mt-4">
          <FiSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Your Menus"
            className="h-12 w-full rounded-xl border border-transparent bg-neutral-50 pl-11 pr-10 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-kupa-600 focus:bg-white focus:ring-4 focus:ring-kupa-600/10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-600"
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* category tabs */}
      <div className="no-scrollbar sticky top-0 z-10 mt-3 flex gap-5 overflow-x-auto border-b border-neutral-100 bg-white/95 px-5 backdrop-blur">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 py-3 text-xs transition-colors ${
              tab === t.id ? "font-semibold text-kupa-600" : "text-neutral-400"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                layoutId="menu-tab"
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-kupa-600"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="px-5 pt-5">
        {error && !foods.length ? (
          <div className="space-y-3 pt-10 text-center">
            <p className="text-sm text-neutral-500">{error}</p>
            <div className="mx-auto w-32">
              <Button variant="soft" onClick={reload}>
                Try again
              </Button>
            </div>
          </div>
        ) : loading && !foods.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : showSections ? (
          <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {top.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold">Top of Week</h3>
                <FoodRow foods={top} onSelect={open} />
              </section>
            )}
            {sections.map((s) => (
              <section key={s.category.id}>
                <h3 className="mb-3 text-sm font-semibold">{s.category.name}</h3>
                <FoodRow foods={s.items} onSelect={open} />
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative grid grid-cols-2 gap-x-4 gap-y-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((f, i) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 8) * 0.04 } }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  >
                    <FoodCard food={f} onClick={open} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-16 text-center">
<motion.div
  animate={{ rotate: [0, -10, 10, 0] }}
  transition={{ duration: 2, repeat: Infinity }}
  className="flex justify-center text-kupa-200"
>
  <PiForkKnife size={56} />
</motion.div>
                <p className="mt-3 text-sm font-semibold">No dishes found</p>
                <p className="mt-1 text-xs text-neutral-400">Try a different search or category.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}