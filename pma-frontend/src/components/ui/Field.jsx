export function Label({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-2xs font-normal text-muted tracking-[0.04em] mb-2"
    >
      {children}
    </label>
  );
}

export function Input({ mono = false, className = "", ...props }) {
  return (
    <input
      className={`w-full h-8 px-2.5 text-xs rounded-sm bg-base text-fg border border-line placeholder:text-muted/60 transition-colors duration-[130ms] ease-out hover:border-line/80 focus:border-accent focus:outline-none focus-visible:outline-none ${
        mono ? "font-mono" : ""
      } ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-2.5 py-2 text-xs rounded-sm bg-base text-fg border border-line placeholder:text-muted/60 resize-none transition-colors duration-[130ms] ease-out focus:border-accent focus:outline-none focus-visible:outline-none ${className}`}
      {...props}
    />
  );
}