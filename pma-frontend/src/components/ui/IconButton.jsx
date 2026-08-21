export default function IconButton({
  icon: Icon,
  label,
  danger = false,
  active = false,
  size = 18,
  className = "",
  ...props
}) {
  const tone = danger
    ? "text-danger/70 hover:text-danger hover:bg-danger/10"
    : active
    ? "text-accent-text bg-accent/12"
    : "text-muted hover:text-fg hover:bg-hover";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-sm p-2 transition-colors duration-[130ms] ease-out disabled:cursor-not-allowed disabled:opacity-40 ${tone} ${className}`}
      {...props}
    >
      <Icon size={size} strokeWidth={1.5} />
    </button>
  );
}