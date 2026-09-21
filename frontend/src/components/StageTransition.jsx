import { cn } from "@/lib/utils";

/**
 * The curtain between stages of the demo.
 *
 * Three bands — Mardi Gras purple, green, gold — sweep up to cover the screen,
 * hold while the next stage mounts underneath, then sweep away. The label
 * blur-fades in behind them. Timings are driven by the parent; see
 * TransitionProvider.
 */
export function StageTransition({ phase, label }) {
  if (phase === "idle") return null;

  const covering = phase === "cover" || phase === "hold";

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Bands. Staggered so they read as streamers rather than one block. */}
      {[
        { color: "#4A1F5C", delay: 0 },
        { color: "#2F6B3E", delay: 70 },
        { color: "#E8C547", delay: 140 },
      ].map((band, index) => (
        <div
          key={band.color}
          className="absolute inset-y-0"
          style={{
            left: `${index * 33.34}%`,
            width: "33.34%",
            background: band.color,
            transform: covering ? "translateY(0)" : "translateY(-101%)",
            transition: `transform 520ms cubic-bezier(0.16, 1, 0.3, 1) ${band.delay}ms`,
          }}
        />
      ))}

      {/* Ink veil so the label reads over the bands */}
      <div
        className="absolute inset-0 bg-ink"
        style={{
          opacity: covering ? 0.82 : 0,
          transition: "opacity 380ms cubic-bezier(0.16, 1, 0.3, 1) 180ms",
        }}
      />

      {/* Beads falling through the curtain */}
      {covering &&
        BEADS.map((bead) => (
          <span
            key={`${bead.left}-${bead.delay}`}
            className="absolute size-[7px] rounded-full"
            style={{
              left: `${bead.left}%`,
              top: "-8%",
              background: bead.color,
              animation: `sc-bead 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${bead.delay}ms forwards`,
            }}
          />
        ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn("text-center transition-all duration-500")}
          style={{
            opacity: phase === "hold" ? 1 : 0,
            filter: phase === "hold" ? "blur(0px)" : "blur(10px)",
            transform: phase === "hold" ? "translateY(0)" : "translateY(8px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full bg-[#8E55A6]" />
            <span className="h-0.5 w-6 rounded-full bg-[#5A9368]" />
            <span className="h-0.5 w-6 rounded-full bg-[#E8C547]" />
          </div>
          <p className="mt-4 text-[19px] font-semibold tracking-[-0.01em] text-white">
            {label}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes sc-bead {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translateY(115vh) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const BEADS = [
  { left: 8, color: "#E8C547", delay: 120 },
  { left: 19, color: "#8E55A6", delay: 260 },
  { left: 31, color: "#5A9368", delay: 60 },
  { left: 44, color: "#E8C547", delay: 320 },
  { left: 56, color: "#8E55A6", delay: 180 },
  { left: 68, color: "#5A9368", delay: 300 },
  { left: 80, color: "#E8C547", delay: 90 },
  { left: 91, color: "#8E55A6", delay: 240 },
];
