import TopoPattern from "./TopoPattern";

export default function PatternBackdrop({
  opacity = 0.5,
  fade = "ellipse 55% 45% at 50% 45%",
  className = "",
}) {
  const mask = `radial-gradient(${fade}, transparent 25%, rgba(0,0,0,0.35) 55%, black 90%)`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 text-line ${className}`}
      style={{
        opacity,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <TopoPattern className="w-full h-full" />
    </div>
  );
}