interface Props {
  className?: string;
  color?: string;
  size?: number;
  opacity?: number;
}

/**
 * Repeating Moroccan zellige geometry — pure SVG, themable.
 * Defaults to gold at low opacity so it sits behind content as a watermark.
 */
const ZelligePattern = ({
  className = "",
  color = "hsl(var(--gold))",
  size = 140,
  opacity = 0.08,
}: Props) => (
  <svg
    aria-hidden
    className={`pointer-events-none ${className}`}
    width="100%"
    height="100%"
    style={{ opacity }}
  >
    <defs>
      <pattern
        id={`zellige-${size}`}
        x="0"
        y="0"
        width={size}
        height={size}
        patternUnits="userSpaceOnUse"
      >
        <g fill="none" stroke={color} strokeWidth="0.8">
          <polygon points={`${size / 2},6 ${size * 0.72},${size * 0.28} ${size - 6},${size * 0.28} ${size * 0.78},${size * 0.5} ${size - 6},${size * 0.72} ${size / 2},${size * 0.6} 6,${size * 0.72} ${size * 0.22},${size * 0.5} 6,${size * 0.28} ${size * 0.28},${size * 0.28}`} />
          <circle cx={size / 2} cy={size / 2} r={size * 0.18} />
          <polygon points={`${size / 2},${size * 0.36} ${size * 0.62},${size / 2} ${size / 2},${size * 0.64} ${size * 0.38},${size / 2}`} />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#zellige-${size})`} />
  </svg>
);

export default ZelligePattern;