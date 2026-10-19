import { useEffect, useState } from 'react';

// Motion rule #3 from the design system: budget bars fill to their value on
// first render, rather than appearing already-full.
export default function ProgressBar({ percent, barClass = 'bg-ink', label }) {
  const [width, setWidth] = useState(0);
  const clamped = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${clamped}% used`}
      className="h-2 w-full overflow-hidden rounded-full bg-paper"
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
