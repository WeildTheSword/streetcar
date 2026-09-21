import masks from "@/assets/mardi-gras-masks.png";

const CONFETTI = [
  [10, 30, "#8E55A6"], [26, 7, "#E8C547"], [34, 15, "#5A9368"],
  [46, 5, "#8E55A6"], [58, 13, "#E8C547"], [70, 7, "#5A9368"],
  [19, 21, "#E8C547"], [40, 27, "#8E55A6"], [64, 22, "#5A9368"],
  [86, 11, "#8E55A6"], [92, 26, "#E8C547"], [4, 32, "#5A9368"],
  [78, 34, "#E8C547"], [30, 38, "#5A9368"], [54, 41, "#8E55A6"],
];

/**
 * Sign-in panel backdrop: the brand's Mardi Gras masks over a New Orleans
 * night sky.
 *
 * Palette is the design system's Mardi Gras tokens (colors_and_type.css) —
 * purple sky, gold light, purple/green/gold confetti. The artwork is RGBA, so
 * it composites straight onto the panel with no plate to knock out.
 */
export function LoginBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #4A1F5C 0%, #2E1338 45%, #140B06 100%)",
        }}
      />

      {/* Gold stage light behind the masks */}
      <div
        className="absolute top-[-14%] left-1/2 size-[760px] -translate-x-1/2 opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(242,219,136,0.30) 0%, rgba(232,197,71,0.10) 42%, transparent 68%)",
        }}
      />

      {/* Confetti */}
      {CONFETTI.map(([left, top, color]) => (
        <span
          key={`${left}-${top}`}
          className="absolute size-[5px] rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            background: color,
            opacity: 0.55,
          }}
        />
      ))}

      {/* The masks */}
      <img
        src={masks}
        alt=""
        className="absolute top-[6%] left-1/2 w-[86%] max-w-[620px] -translate-x-1/2 drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      />

      {/* Beads: a strand swagged across beneath the masks */}
      <svg
        viewBox="0 0 400 60"
        fill="none"
        className="absolute inset-x-0 top-[52%] w-full opacity-60"
      >
        <path
          d="M-10 6 C 90 54, 310 54, 410 6"
          stroke="#B8935A"
          strokeWidth="1"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
      </svg>

      {/* Dissolve into the panel so the headline sits on flat ink */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-ink via-ink/90 to-transparent" />
    </div>
  );
}
