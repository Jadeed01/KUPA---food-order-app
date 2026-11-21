import { useState } from "react";
import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import GoogleButton from "../components/GoogleButton";
import { useAuth } from "../context/AuthContext";
import { getError } from "../lib/api";
import { fadeUp, stagger } from "../lib/motion";
import { PiHandWavingFill } from "react-icons/pi";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login, googleLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/home", { replace: true });
    } catch (err) {
      if (err.response?.data?.code === "email_not_verified") {
        navigate("/verify-email", { state: { email: err.response.data.email } });
        return;
      }
      setError(getError(err, "Login failed. Check your details."));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async (credential) => {
    setError("");
    try {
      await googleLogin(credential);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(getError(err, "Google sign-in failed."));
    }
  };

  return (
    <AuthLayout
title={
  <span className="inline-flex items-center gap-2">
    Welcome Back
    <motion.span
      className="inline-block origin-[70%_70%] text-kupa-600"
      animate={{ rotate: [0, 16, -8, 16, -4, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
    >
      <PiHandWavingFill size={26} />
    </motion.span>
  </span>
}
      subtitle="Sign in to your account"
    >
      <motion.form variants={stagger} onSubmit={onSubmit} className="flex flex-col gap-4">
        <motion.div variants={fadeUp}>
          <Message type="success">{state?.message}</Message>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input label="Email" type="email" placeholder="Your email" required value={form.email} onChange={set("email")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input label="Password" type="password" placeholder="Your password" required value={form.password} onChange={set("password")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link to="/forgot-password" className="text-xs font-semibold text-kupa-600">
            Forgot Password?
          </Link>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Message>{error}</Message>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </motion.div>
      </motion.form>

      <motion.p variants={fadeUp} className="mt-5 text-center text-xs text-neutral-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-kupa-600">
          Sign Up
        </Link>
      </motion.p>

      <motion.div variants={fadeUp} className="my-5 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        Or with
        <span className="h-px flex-1 bg-neutral-200" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <GoogleButton onCredential={onGoogle} onError={setError} />
      </motion.div>
    </AuthLayout>
  );
}