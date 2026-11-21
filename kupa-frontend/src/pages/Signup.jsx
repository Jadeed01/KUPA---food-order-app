import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import api, { getError } from "../lib/api";
import { fadeUp, stagger } from "../lib/motion";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      await api.post("/auth/register/", { ...form, full_name: form.full_name.trim(), email });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up" subtitle="Create account and choose favorite menu">
      <motion.form variants={stagger} onSubmit={onSubmit} className="flex flex-col gap-4">
        <motion.div variants={fadeUp}>
          <Input label="Name" placeholder="Your name" required value={form.full_name} onChange={set("full_name")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input label="Email" type="email" placeholder="Your email" required value={form.email} onChange={set("email")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input label="Password" type="password" placeholder="Your password" required minLength={8} value={form.password} onChange={set("password")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Message>{error}</Message>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button type="submit" loading={loading}>
            Register
          </Button>
        </motion.div>
      </motion.form>

      <motion.p variants={fadeUp} className="mt-5 text-center text-xs text-neutral-500">
        Have an account?{" "}
        <Link to="/login" className="font-semibold text-kupa-600">
          Sign In
        </Link>
      </motion.p>

      <motion.p variants={fadeUp} className="mt-auto pt-8 text-center text-[11px] text-neutral-400">
        By clicking Register, you agree to our{" "}
        <span className="font-semibold text-kupa-600">Terms and Data Policy.</span>
      </motion.p>
    </AuthLayout>
  );
}