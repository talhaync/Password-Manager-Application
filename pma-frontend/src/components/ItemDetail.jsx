import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, Trash2, KeyRound, RefreshCw } from "lucide-react";
import client from "../api/client";
import Button from "./ui/Button";
import IconButton from "./ui/IconButton";
import TopoPattern from "./TopoPattern";
import { Label, Input, Textarea } from "./ui/Field";

const MASKED = "••••••••••••";

const SETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}",
};

function generatePassword(length = 20) {
  const pool = SETS.lower + SETS.upper + SETS.digits + SETS.symbols;
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => pool[n % pool.length]).join("");
}

export default function ItemDetail({ entry, onSaved, onDelete }) {
  const [platformName, setPlatformName] = useState("");
  const [platformUsername, setPlatformUsername] = useState("");
  const [password, setPassword] = useState(MASKED);
  const [notes, setNotes] = useState("");

  const [visible, setVisible] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState("");

  const isMasked = password === MASKED;

  // Reload the form whenever a different item is selected. Resetting the
  // password to the mask also drops any value revealed for the previous item.
  useEffect(() => {
    if (!entry) return;
    setPlatformName(entry.platformName || "");
    setPlatformUsername(entry.platformUsername || "");
    setNotes(entry.notes || "");
    setPassword(MASKED);
    setVisible(false);
    setCopied(null);
    setError("");
  }, [entry?.id]);

  // Hide a revealed password after 30 seconds on screen.
  useEffect(() => {
    if (!visible || isMasked) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setPassword(MASKED);
    }, 30000);
    return () => clearTimeout(timer);
  }, [visible, isMasked]);

  // Hide it as soon as the tab loses focus.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setVisible(false);
        setPassword(MASKED);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  if (!entry) return <EmptyState />;

  const fetchPassword = async () => {
    const response = await client.get(`/vault/${entry.id}/reveal`);
    return response.data.password;
  };

  const toggleOrReveal = async () => {
    if (!isMasked) {
      setVisible(!visible);
      return;
    }
    setRevealing(true);
    try {
      setPassword(await fetchPassword());
      setVisible(true);
    } catch {
      setError("Couldn't retrieve the password.");
    } finally {
      setRevealing(false);
    }
  };

  const copy = async (kind) => {
    try {
      const value =
        kind === "username"
          ? platformUsername
          : isMasked
          ? await fetchPassword()
          : password;

      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);

      // Clear the clipboard later, but only if it still holds our value.
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === value) await navigator.clipboard.writeText("");
        } catch {
          /* clipboard read blocked — nothing to do */
        }
      }, 20000);
    } catch {
      setError("Couldn't copy to clipboard.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await client.put(`/vault/${entry.id}`, {
        platformName,
        platformUsername,
        notes,
        password: isMasked ? "" : password,
      });
      setPassword(MASKED);
      setVisible(false);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex-1 min-w-0 flex flex-col bg-raised">
      <header className="h-14 px-4 flex items-center justify-between gap-3 border-b border-line">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 shrink-0 rounded-sm bg-surface border border-line flex items-center justify-center">
            <span className="text-xs font-medium text-muted">
              {entry.platformName?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <h2 className="text-base font-semibold text-fg truncate">{entry.platformName}</h2>
        </div>

        <Button variant="danger" icon={Trash2} onClick={() => onDelete(entry)}>
          Delete
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scroll-thin p-4">
          <div className="max-w-lg space-y-4">
            <div>
              <Label htmlFor="detail-name">Name</Label>
              <Input
                id="detail-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="detail-username">Username</Label>
              <div className="flex gap-1.5">
                <Input
                  id="detail-username"
                  value={platformUsername}
                  onChange={(e) => setPlatformUsername(e.target.value)}
                  required
                  className="flex-1 min-w-0 h-9 text-sm"
                />
                <IconButton
                  icon={copied === "username" ? Check : Copy}
                  label="Copy username"
                  onClick={() => copy("username")}
                  className={`h-9 w-9 shrink-0 border border-line ${
                    copied === "username" ? "text-success" : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="detail-password">Password</Label>
              <div className="flex gap-1.5">
                <Input
                  id="detail-password"
                  type={visible && !isMasked ? "text" : "password"}
                  mono
                  value={password}
                  onChange={(e) =>
                    setPassword(isMasked ? e.target.value.replace(MASKED, "") : e.target.value)
                  }
                  required
                  disabled={revealing}
                  className="flex-1 min-w-0 h-9 text-sm"
                />
                <IconButton
                  icon={visible && !isMasked ? EyeOff : Eye}
                  label={isMasked ? "Load current password" : visible ? "Hide" : "Show"}
                  active={visible && !isMasked}
                  disabled={revealing}
                  onClick={toggleOrReveal}
                  className="h-9 w-9 shrink-0 border border-line"
                />
                <IconButton
                  icon={copied === "password" ? Check : Copy}
                  label="Copy password"
                  onClick={() => copy("password")}
                  className={`h-9 w-9 shrink-0 border border-line ${
                    copied === "password" ? "text-success" : ""
                  }`}
                />
                <IconButton
                  icon={RefreshCw}
                  label="Generate new password"
                  onClick={() => {
                    setPassword(generatePassword());
                    setVisible(true);
                  }}
                  className="h-9 w-9 shrink-0 border border-line"
                />
              </div>

              {visible && !isMasked && (
                <>
                  <TintedPassword value={password} />
                  <StrengthBar value={password} />
                  <p className="mt-1.5 text-2xs text-muted">
                    Hides automatically after 30 seconds
                  </p>
                </>
              )}

              {isMasked && (
                <p className="mt-2 text-2xs text-muted">
                  Leave as is to keep the current password.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="detail-notes">Notes</Label>
              <Textarea
                id="detail-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            {error && (
              <p className="text-2xs text-danger bg-danger/10 border border-danger/25 rounded-sm px-2.5 py-2">
                {error}
              </p>
            )}
          </div>
        </div>

        <footer className="h-16 px-4 flex items-center justify-end border-t border-line">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </footer>
      </form>
    </section>
  );
}

// Digits and symbols are tinted differently from letters so the password can be
// read aloud or retyped without misreading characters.
function TintedPassword({ value }) {
  return (
    <div className="mt-2 text-sm font-mono break-all">
      {value.split("").map((char, i) => {
        const tone = /[0-9]/.test(char)
          ? "text-pw-digit"
          : /[a-zA-Z]/.test(char)
          ? "text-pw-letter"
          : "text-pw-symbol";
        return (
          <span key={i} className={tone}>
            {char}
          </span>
        );
      })}
    </div>
  );
}

function StrengthBar({ value }) {
  const { score, label, color } = getStrength(value);

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="h-1 w-28 rounded-full bg-hover overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-[130ms] ease-out ${color}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <span className="text-2xs text-muted">{label}</span>
    </div>
  );
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very weak", color: "bg-danger" },
    { label: "Weak", color: "bg-danger" },
    { label: "Fair", color: "bg-warning" },
    { label: "Good", color: "bg-accent" },
    { label: "Strong", color: "bg-success" },
  ];

  return { score, ...levels[score] };
}

// With no item selected this panel is the largest empty area in the app, so the
// contour pattern earns its place here.
function EmptyState() {
  return (
    <section className="relative flex-1 flex items-center justify-center bg-raised overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-line opacity-60"
        style={{
          maskImage: "radial-gradient(ellipse 50% 40% at 50% 50%, transparent 10%, black 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 50% 40% at 50% 50%, transparent 10%, black 65%)",
        }}
      >
        <TopoPattern className="w-full h-full" />
      </div>

      <div className="relative text-center">
        <KeyRound size={22} strokeWidth={1.5} className="text-muted/50 mx-auto mb-3" />
        <p className="text-sm text-muted">Select an item to view and edit it</p>
      </div>
    </section>
  );
}