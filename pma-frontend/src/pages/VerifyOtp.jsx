import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Field";

// Mirrors app.otp.expiration-minutes on the backend. This countdown is only for
// the user's benefit — the real expiry check happens server-side.
const OTP_LIFETIME_SECONDS = 180;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyOtp() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(OTP_LIFETIME_SECONDS);

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // The email and password come from the login step. Without them this page has
  // no context, so send the user back.
  const email = location.state?.email;
  const password = location.state?.password;

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Count down the code's remaining lifetime.
  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [expiresIn]);

  // Count down the resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      await verifyOtp({ email, code });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't verify the code.");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);

    try {
      await client.post("/login", { email, password });
      setInfo("A new code has been sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiresIn(OTP_LIFETIME_SECONDS);
      setCode("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send a new code.");
      // The backend enforces its own cooldown; mirror it so the button stays
      // disabled for the same window.
      if (err.response?.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  const expired = expiresIn <= 0;

  return (
    <AuthLayout
      title="Check your email"
      description={
        <>
          We sent a 6-digit code to <span className="text-fg">{email}</span>.{" "}
          {expired ? (
            <span className="text-danger">This code has expired — request a new one.</span>
          ) : (
            <>
              It expires in{" "}
              <span className="text-fg tabular-nums">{formatTime(expiresIn)}</span>.
            </>
          )}
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors duration-[130ms] ease-out"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to sign in
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-xs text-accent-text hover:text-accent-hover disabled:text-muted disabled:cursor-not-allowed transition-colors duration-[130ms] ease-out whitespace-nowrap"
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resending
              ? "Sending…"
              : "Resend code"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            ref={inputRef}
            mono
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            disabled={expired}
            className="h-10 text-center text-base tracking-[0.5em]"
          />
        </div>

        {error && (
          <p className="text-2xs text-danger bg-danger/10 border border-danger/25 rounded-sm px-2.5 py-2">
            {error}
          </p>
        )}

        {info && (
          <p className="text-2xs text-muted bg-hover border border-line rounded-sm px-2.5 py-2">
            {info}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading || code.length !== 6 || expired}
          className="w-full"
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}