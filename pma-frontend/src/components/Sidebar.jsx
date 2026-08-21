import { Shield, LayoutGrid, Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import IconButton from "./ui/IconButton";
import PatternBackdrop from "./PatternBackdrop";

export default function Sidebar({ itemCount, onCreate }) {
  const { email, logout } = useAuth();
  const initial = email?.[0]?.toUpperCase() || "?";

  return (
    <aside className="w-[248px] shrink-0 flex flex-col bg-base border-r border-line">
      <div className="h-14 px-4 flex items-center gap-2 border-b border-line">
        <Shield size={18} strokeWidth={1.5} className="text-accent-text" />
        <span className="text-sm font-medium text-fg">Personal vault</span>
      </div>

      <div className="p-3">
        <Button variant="primary" icon={Plus} onClick={onCreate} className="w-full">
          New item
        </Button>
      </div>

      <nav className="relative px-2 flex-1 overflow-hidden">
        {/* The nav holds a single row, so most of this column is empty space. */}
        <PatternBackdrop opacity={0.35} fade="ellipse 80% 30% at 50% 8%" />

        <button
          className="relative w-full h-9 px-2 flex items-center gap-2.5 rounded-sm bg-accent/12 text-accent-text transition-colors duration-[130ms] ease-out"
          aria-current="page"
        >
          <LayoutGrid size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium flex-1 text-left">All items</span>
          <span className="text-xs tabular-nums text-accent-text/70">{itemCount}</span>
        </button>
      </nav>

      <div className="h-14 px-3 flex items-center gap-2.5 border-t border-line">
        <div className="size-7 shrink-0 rounded-full bg-hover border border-line flex items-center justify-center">
          <span className="text-xs font-medium text-muted">{initial}</span>
        </div>
        <span className="text-xs text-muted truncate flex-1" title={email}>
          {email}
        </span>
        <IconButton icon={LogOut} label="Sign out" onClick={logout} size={16} />
      </div>
    </aside>
  );
}