import { useState, useEffect } from "react";
import { RefreshCw, Eye, EyeOff, X } from "lucide-react";
import client from "../api/client";
import Button from "./ui/Button";
import IconButton from "./ui/IconButton";
import { Label, Input, Textarea } from "./ui/Field";

// Placeholder shown for an existing entry's password. It is never sent to the
// server — if it is still untouched on save, the password field is sent empty
// and the backend leaves the stored password alone.
const MASKED = "••••••••••••";

const SETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}",
};

// Characters that are easy to confuse when read or retyped by hand.
const AMBIGUOUS = "lIO01";

function buildPassword({ length, upper, lower, digits, symbols, excludeAmbiguous }) {
  let pool = "";
  if (lower) pool += SETS.lower;
  if (upper) pool += SETS.upper;
  if (digits) pool += SETS.digits;
  if (symbols) pool += SETS.symbols;
  if (!pool) pool = SETS.lower;

  if (!excludeAmbiguous) pool += AMBIGUOUS;

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => pool[n % pool.length]).join("");
}

export default function EntryModal({ entry, onClose, onSave }) {
  const [platformName, setPlatformName] = useState("");
  const [platformUsername, setPlatformUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [visible, setVisible] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [options, setOptions] = useState({
    length: 20,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: true,
  });

  const isMasked = password === MASKED;

  useEffect(() => {
    if (entry) {
      setPlatformName(entry.platformName || "");
      setPlatformUsername(entry.platformUsername || "");
      setNotes(entry.notes || "");
      setPassword(MASKED);
    } else {
      setPlatformName("");
      setPlatformUsername("");
      setNotes("");
      setPassword("");
    }
    setVisible(false);
    setError("");
  }, [entry]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const reveal = async () => {
    setRevealing(true);
    setError("");
    try {
      const response = await client.get(`/vault/${entry.id}/reveal`);
      setPassword(response.data.password);
      setVisible(true);
    } catch {
      setError("Couldn't load the current password.");
    } finally {
      setRevealing(false);
    }
  };

  // One button, two jobs: fetch the real password the first time, then act as a
  // plain show/hide toggle.
  const toggleOrReveal = () => {
    if (isMasked) {
      reveal();
    } else {
      setVisible(!visible);
    }
  };

  const generate = (nextOptions = options) => {
    setPassword(buildPassword(nextOptions));
    setVisible(true);
  };

  const updateOption = (key, value) => {
    const next = { ...options, [key]: value };
    setOptions(next);
    if (password && !isMasked) generate(next);
  };

  // Typing over the mask starts a fresh value instead of appending to the dots.
  const handleChangePassword = (value) => {
    setPassword(isMasked ? value.replace(MASKED, "") : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        platformName,
        platformUsername,
        notes,
        password: isMasked ? "" : password,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the item.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={entry ? "Edit item" : "New item"}
    >
      <div
        className="w-full max-w-md bg-raised rounded-md border border-line shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-12 px-4 flex items-center justify-between border-b border-line">
          <h2 className="text-sm font-semibold text-fg">{entry ? "Edit item" : "New item"}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} size={16} />
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="platform">Name</Label>
            <Input
              id="platform"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
              autoFocus
              placeholder="GitHub"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={platformUsername}
              onChange={(e) => setPlatformUsername(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setGeneratorOpen(!generatorOpen)}
                className="text-2xs text-accent-text hover:text-accent-hover transition-colors duration-[130ms] ease-out -mt-2"
              >
                {generatorOpen ? "Hide generator" : "Generator"}
              </button>
            </div>

            <div className="flex gap-1.5">
              <Input
                id="password"
                type={visible && !isMasked ? "text" : "password"}
                mono
                value={password}
                onChange={(e) => handleChangePassword(e.target.value)}
                required
                disabled={revealing}
                className="flex-1 min-w-0"
              />
              <IconButton
                icon={visible && !isMasked ? EyeOff : Eye}
                label={
                  isMasked
                    ? "Load current password"
                    : visible
                    ? "Hide password"
                    : "Show password"
                }
                active={visible && !isMasked}
                disabled={revealing}
                onClick={toggleOrReveal}
                className="h-8 w-8 shrink-0 border border-line"
              />
              <IconButton
                icon={RefreshCw}
                label="Generate password"
                onClick={() => generate()}
                className="h-8 w-8 shrink-0 border border-line"
              />
            </div>

            {generatorOpen && <Generator options={options} onChange={updateOption} />}

            {entry && isMasked && (
              <p className="mt-2 text-2xs text-muted">
                Leave as is to keep the current password.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-2xs text-danger bg-danger/10 border border-danger/25 rounded-sm px-2.5 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Generator({ options, onChange }) {
  return (
    <div className="mt-3 p-3 rounded-sm bg-surface border border-line space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xs text-muted w-14 shrink-0">Length</span>
        <input
          type="range"
          min={8}
          max={64}
          value={options.length}
          onChange={(e) => onChange("length", Number(e.target.value))}
          className="flex-1 h-1 accent-accent cursor-pointer"
          aria-label="Password length"
        />
        <span className="text-2xs text-fg tabular-nums w-6 text-right">{options.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Toggle label="A-Z" checked={options.upper} onChange={(v) => onChange("upper", v)} />
        <Toggle label="a-z" checked={options.lower} onChange={(v) => onChange("lower", v)} />
        <Toggle label="0-9" checked={options.digits} onChange={(v) => onChange("digits", v)} />
        <Toggle label="!@#$" checked={options.symbols} onChange={(v) => onChange("symbols", v)} />
      </div>

      <Toggle
        label="Exclude look-alike characters"
        checked={options.excludeAmbiguous}
        onChange={(v) => onChange("excludeAmbiguous", v)}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-accent cursor-pointer"
      />
      <span className="text-2xs text-muted">{label}</span>
    </label>
  );
}