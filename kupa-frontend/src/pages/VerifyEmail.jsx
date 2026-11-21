import { useCallback, useEffect, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OtpBoxes from "../components/OtpBoxes";
import Button from "../components/Button";
import Message from "../components/Message";
import { useAuth } from "../context/AuthContext";
import api, { getError } from "../lib/api";
import { fadeUp, stagger } from "../lib/motion";
import { FiDelete } from "react-icons/fi";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function VerifyEmail() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const controls = useAnimationControls();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const press = useCallback((k) => {
    setError("");
    setInfo("");
    setCode((c) => (k === "back" ? c.slice(0, -1) : c.length < 4 ? c + k : c));
  }, []);

  // physical keyboard support (desktop)
  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const submit = async (value) => {
    if (loading || value.length < 4) return;
    setLoading(true);
    try {
      await verifyEmail(email, value);
      navigate("/congratulations", { replace: true });
    } catch (err) {
      setError(getError(err, "Invalid or expired code."));
      setCode("");
      controls.start({ x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.4 } });
    } finally {
      setLoading(false);
    }
  };

  // auto-submit when 4 digits are in
  useEffect(() => {
    if (code.length === 4) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    setError("");
    try {
      await api.post("/auth/resend-otp/", { email, purpose: "verify" });
      setCooldown(30);
      setInfo("New code sent. Check your email.");
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <AuthLayout title="Verification Email" subtitle="Please enter the code we just sent to email">
      <motion.p variants={fadeUp} className="-mt-6 mb-8 text-sm font-semibold text-neutral-800">
        {email}
      </motion.p>

      <motion.div variants={stagger} className="flex flex-1 flex-col">
        <motion.div variants={fadeUp} animate={controls}>
          <OtpBoxes value={code} />
        </motion.div>

        <motion.p variants={fadeUp} className="mt-5 text-center text-xs text-neutral-500">
          If you didn't receive a code?{" "}
          {cooldown > 0 ? (
            <span className="font-semibold text-neutral-400">Resend in {cooldown}s</span>
          ) : (
            <button type="button" onClick={resend} className="font-semibold text-kupa-600">
              Resend
            </button>
          )}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-4 space-y-2">
          <Message>{error}</Message>
          <Message type="success">{info}</Message>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6">
          <Button loading={loading} disabled={code.length < 4} onClick={() => submit(code)}>
            Continue
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-auto grid grid-cols-3 pt-6">
          {KEYS.map((k, i) =>
            k === "" ? (
              <div key={i} />
            ) : (
              <motion.button
                key={i}
                type="button"
                whileTap={{ scale: 0.85, backgroundColor: "#eef7f1" }}
                onClick={() => press(k)}
                className="mx-2 my-1 flex h-14 items-center justify-center rounded-2xl bg-white text-xl font-medium text-neutral-800"
                aria-label={k === "back" ? "Backspace" : k}
              >
                {k === "back" ? <FiDelete size={22} /> : k}
              </motion.button>
            )
          )}
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}