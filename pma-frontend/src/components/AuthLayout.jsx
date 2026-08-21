import { Shield } from "lucide-react";
import PatternBackdrop from "./PatternBackdrop";

export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="relative min-h-screen bg-base flex items-center justify-center px-4 py-10 overflow-hidden">
      <PatternBackdrop opacity={0.45} fade="ellipse 50% 45% at 50% 45%" />

      <div className="relative w-full max-w-[340px]">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={18} strokeWidth={1.5} className="text-accent-text" />
          <span className="text-sm font-medium text-fg">Vault</span>
        </div>

        <h1 className="text-base font-semibold text-fg mb-1">{title}</h1>
        <p className="text-xs text-muted mb-6 leading-relaxed">{description}</p>

        {children}

        {footer && <div className="mt-6 pt-4 border-t border-line">{footer}</div>}
      </div>
    </div>
  );
}