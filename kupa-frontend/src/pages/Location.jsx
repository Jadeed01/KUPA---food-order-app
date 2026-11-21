import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowLeft, FiBriefcase, FiHome, FiMapPin, FiSearch, FiTrash2 } from "react-icons/fi";
import { MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LocationPicker from "../components/LocationPicker";
import Button from "../components/Button";
import Input from "../components/Input";
import Message from "../components/Message";
import { useAddresses } from "../context/AddressContext";
import { getError } from "../lib/api";

// Fallback map center if location access is denied. Change it to your city.
const DEFAULT_CENTER = { lat: 7.3775, lng: 3.947 };
const NOMINATIM = "https://nominatim.openstreetmap.org";

const LABELS = [
  { id: "home", name: "Home", Icon: FiHome },
  { id: "office", name: "Office", Icon: FiBriefcase },
  { id: "other", name: "Others", Icon: FiMapPin },
];

function parseAddress(a = {}, displayName = "") {
  const road = a.road || a.pedestrian || a.footway || a.neighbourhood || a.suburb || "";
  const street = [a.house_number, road].filter(Boolean).join(" ");
  return {
    street: street || displayName.split(",")[0] || "",
    city: a.city || a.town || a.village || a.municipality || a.county || a.state_district || "",
    state: a.state || "",
    postal_code: a.postcode || "",
    country: a.country || "",
  };
}

export default function Location() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const back = state?.from || "/home";
  const { addresses, defaultAddress, addAddress, makeDefault, removeAddress } = useAddresses();

  const [pos, setPos] = useState(DEFAULT_CENTER);
  const [flyTo, setFlyTo] = useState(null);
  const [fields, setFields] = useState({ street: "", city: "", state: "", postal_code: "", country: "" });
  const [label, setLabel] = useState("home");
  const [geoLoading, setGeoLoading] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const initRef = useRef(false);

  const locate = useCallback((silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setError("Your browser doesn't support location.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(next);
        setFlyTo({ ...next, id: Date.now() });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        if (!silent) setError("Couldn't get your location. Allow location access or pick a spot on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // start at the default address if there is one, otherwise try the device location
  useEffect(() => {
    if (initRef.current || addresses === undefined) return;
    initRef.current = true;
    if (defaultAddress?.latitude && defaultAddress?.longitude) {
      const p = { lat: Number(defaultAddress.latitude), lng: Number(defaultAddress.longitude) };
      setPos(p);
      setFlyTo({ ...p, id: Date.now() });
    } else {
      locate(true);
    }
  }, [addresses, defaultAddress, locate]);

  // fill the form from the pin position (OpenStreetMap / Nominatim, debounced)
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&accept-language=en&lat=${pos.lat}&lon=${pos.lng}`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        if (data && !data.error) setFields(parseAddress(data.address, data.display_name));
      } catch {
        /* aborted or offline: the user can type the address manually */
      }
    }, 700);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [pos]);

  const search = async (e) => {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setError("");
    setSearching(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&accept-language=en&q=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      setResults(data);
      if (!data.length) setError("No places found. Try a different search.");
    } catch {
      setError("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const pick = (r) => {
    const p = { lat: Number(r.lat), lng: Number(r.lon) };
    setPos(p);
    setFlyTo({ ...p, id: Date.now() });
    setResults([]);
    setQ("");
  };

  const setField = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setError("");
    if (!fields.street.trim() || !fields.city.trim()) {
      setError("Add a street and a city for this address.");
      return;
    }
    setSaving(true);
    try {
      await addAddress({
        label,
        street: fields.street.trim(),
        city: fields.city.trim(),
        state: fields.state.trim(),
        postal_code: fields.postal_code,
        country: fields.country,
        latitude: pos.lat.toFixed(6),
        longitude: pos.lng.toFixed(6),
        is_default: true,
      });
      navigate(back, { replace: true });
    } catch (err) {
      setError(getError(err, "Couldn't save the address."));
    } finally {
      setSaving(false);
    }
  };

  const chooseAddress = async (a) => {
    try {
      if (!a.is_default) await makeDefault(a.id);
      navigate(back, { replace: true });
    } catch (err) {
      setError(getError(err));
    }
  };

  const remove = async (a) => {
    try {
      await removeAddress(a.id);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <PageTransition className="relative flex flex-col">
      {/* map */}
      <div className="relative h-[42%] min-h-[230px] shrink-0">
        <div className="absolute inset-0 isolate">
          <LocationPicker position={pos} flyTo={flyTo} onChange={(lat, lng) => setPos({ lat, lng })} />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate(back)}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => locate(false)}
          disabled={geoLoading}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-kupa-600 shadow-md"
          aria-label="Use my location"
        >
          <motion.span
            animate={geoLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={geoLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="block"
          >
            <MdMyLocation size={22} />
          </motion.span>
        </motion.button>
      </div>

      {/* details card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 260, delay: 0.1 }}
        className="relative z-10 -mt-6 flex-1 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      >
        <h2 className="text-sm font-semibold">Detail Address</h2>
        <p className="mt-0.5 text-xs text-neutral-400">Search, tap the map, or drag the pin to adjust.</p>

        <form onSubmit={search} className="relative mt-4">
          <FiSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a street or place"
            className="h-12 w-full rounded-xl border border-transparent bg-neutral-50 pl-11 pr-14 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-kupa-600 focus:bg-white focus:ring-4 focus:ring-kupa-600/10"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex h-8 min-w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-kupa-600 px-2.5 text-xs font-semibold text-white"
          >
            {searching ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Go"
            )}
          </button>
        </form>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-xl border border-neutral-100"
            >
              {results.map((r) => (
                <li key={r.place_id} className="border-b border-neutral-100 last:border-0">
                  <button
                    type="button"
                    onClick={() => pick(r)}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-neutral-700 hover:bg-kupa-50"
                  >
                    <FiMapPin size={14} className="mt-0.5 shrink-0 text-kupa-600" />
                    <span className="line-clamp-2">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="mt-4 space-y-3">
          <Input label="Street" placeholder="House number and street" value={fields.street} onChange={setField("street")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" placeholder="City" value={fields.city} onChange={setField("city")} />
            <Input label="State" placeholder="State" value={fields.state} onChange={setField("state")} />
          </div>
        </div>

        <h3 className="mt-5 text-xs font-medium text-neutral-700">Save Address As</h3>
        <div className="mt-2 flex gap-2">
          {LABELS.map(({ id, name, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setLabel(id)}
              className={`relative flex flex-1 items-center justify-center rounded-xl py-2.5 text-xs font-medium transition-colors ${
                label === id ? "text-white" : "bg-neutral-50 text-neutral-500"
              }`}
            >
              {label === id && (
                <motion.span
                  layoutId="label-pill"
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

        <div className="mt-4">
          <Message>{error}</Message>
        </div>

        <div className="mt-4">
          <Button onClick={save} loading={saving}>
            Confirmation
          </Button>
        </div>

        {addresses?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold">Saved addresses</h3>
            <ul className="mt-1">
              <AnimatePresence initial={false}>
                {addresses.map((a) => {
                  const meta = LABELS.find((l) => l.id === a.label) ?? LABELS[2];
                  return (
                    <motion.li
                      key={a.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 border-b border-neutral-100 py-3 last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() => chooseAddress(a)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kupa-50 text-kupa-600">
                          <meta.Icon size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-xs font-semibold">
                            {meta.name}
                            {a.is_default && (
                              <span className="rounded-full bg-kupa-50 px-2 py-0.5 text-[10px] text-kupa-700">Default</span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">{a.full_address}</span>
                        </span>
                      </button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => remove(a)}
                        className="p-2 text-neutral-400 hover:text-red-500"
                        aria-label="Delete address"
                      >
                        <FiTrash2 size={16} />
                      </motion.button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </motion.div>
    </PageTransition>
  );
}