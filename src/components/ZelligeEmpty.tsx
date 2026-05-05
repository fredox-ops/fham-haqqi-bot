/**
 * Custom SVG illustration inspired by Moroccan zellige (geometric tile mosaic).
 * Used for empty states across the app.
 */
const ZelligeEmpty = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 240 240"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="zg-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
        <stop offset="100%" stopColor="hsl(var(--gold-glow))" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="zg-em" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.85" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    <g fill="none" strokeWidth="1.2">
      <circle cx="120" cy="120" r="110" stroke="url(#zg-gold)" strokeOpacity="0.6" />
      <circle cx="120" cy="120" r="80" stroke="url(#zg-em)" strokeOpacity="0.6" />
      <circle cx="120" cy="120" r="50" stroke="url(#zg-gold)" strokeOpacity="0.7" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 45} 120 120)`}>
          <path
            d="M120 30 L150 75 L120 120 L90 75 Z"
            stroke="url(#zg-gold)"
            strokeOpacity="0.7"
          />
          <path
            d="M120 60 L138 90 L120 120 L102 90 Z"
            fill="url(#zg-em)"
            fillOpacity="0.15"
            stroke="url(#zg-em)"
          />
        </g>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={`star-${i}`} transform={`rotate(${i * 30} 120 120)`}>
          <circle cx="120" cy="40" r="3" fill="url(#zg-gold)" />
        </g>
      ))}
      <circle cx="120" cy="120" r="6" fill="url(#zg-gold)" />
    </g>
  </svg>
);

export default ZelligeEmpty;