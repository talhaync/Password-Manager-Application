const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-accent/40 disabled:text-white/60",
  secondary:
    "bg-raised text-fg border border-line hover:bg-hover disabled:text-muted",
  ghost:
    "text-muted hover:text-fg hover:bg-hover disabled:text-muted/50",
  danger:
    "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/15 disabled:opacity-50",
};

const sizes = {
  sm: "h-7 px-2.5 text-2xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm font-medium whitespace-nowrap transition-colors duration-[130ms] ease-out disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} />}
      {children}
    </button>
  );
}