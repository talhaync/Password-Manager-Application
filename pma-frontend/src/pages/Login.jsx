import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/ui/Button";
import { Label, Input } from "../components/ui/Field";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Someone with a live session has no business on the sign-in form.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      // The password checked out and a code was emailed. The session itself
      // only starts once that code is verified on the next screen.
      navigate("/verify-otp", { state: { email, password } });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Your password decrypts your vault. It's never stored in plain text."
      footer={
        <p className="text-xs text-muted">
          No account?{" "}
          <Link
            to="/register"
            className="text-accent-text hover:text-accent-hover transition-colors duration-[130ms] ease-out"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            className="h-10 text-sm"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            mono
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-10 text-sm"
          />
        </div>

        {error && (
          <p className="text-2xs text-danger bg-danger/10 border border-danger/25 rounded-sm px-2.5 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing in…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}