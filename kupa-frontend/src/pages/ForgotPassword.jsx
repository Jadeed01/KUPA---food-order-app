import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import api, { getError } from "../lib/api";
import { fadeUp, stagger } from "../lib/motion";
import { FiMail, FiPhone } from "react-icons/fi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const clean = email.trim().toLowerCase();
      await api.post("/auth/forgot-password/", { email: clean });
      navigate("/reset-password", { state: { email: clean } });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Select which contact details should we use to reset your password"
    >
      <motion.form variants={stagger} onSubmit={submit} className="flex flex-1 flex-col gap-4">
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 rounded-2xl border border-kupa-600/50 bg-kupa-50/60 p-4 ring-4 ring-kupa-600/5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kupa-100 text-kupa-700">
            <FiMail size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold">Email</p>
            <p className="text-xs text-neutral-500">Send to your email</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 opacity-60">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
            <FiPhone size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold">Phone Number</p>
            <p className="text-xs text-neutral-500">Coming soon</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Input label="Your email" type="email" placeholder="Your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Message>{error}</Message>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-auto pt-6">
          <Button type="submit" loading={loading}>
            Continue
          </Button>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}