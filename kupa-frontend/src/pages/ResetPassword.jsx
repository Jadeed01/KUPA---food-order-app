import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OtpBoxes from "../components/OtpBoxes";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import api, { getError } from "../lib/api";
import { fadeUp, stagger } from "../lib/motion";

export default function ResetPassword() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < 4) return setError("Enter the 4-digit code from your email.");
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", { email, code, new_password: password });
      navigate("/login", {
        replace: true,
        state: { message: "Password reset! Log in with your new password." },
      });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle={`Enter the code we sent to ${email ?? "your email"} and set a new password`}>
      <motion.form variants={stagger} onSubmit={submit} className="flex flex-1 flex-col gap-5">
        <motion.div variants={fadeUp} className="relative">
          <OtpBoxes value={code} active={focused} />
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Verification code"
            className="absolute inset-0 h-full w-full opacity-0"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Input label="New password" type="password" placeholder="At least 8 characters" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Message>{error}</Message>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-auto pt-6">
          <Button type="submit" loading={loading}>
            Reset Password
          </Button>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}