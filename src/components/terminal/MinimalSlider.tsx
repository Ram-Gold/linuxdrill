import React, { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

export interface MinimalSliderProps {
  label: string;
  icon?: React.ReactNode;
  value: number;
  defaultValue?: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  accentColor?: string;
  ariaLabel?: string;
}

export default function MinimalSlider({
  label,
  icon,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  accentColor = 'var(--accent-primary)',
  ariaLabel,
}: MinimalSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isThumbHovered, setIsThumbHovered] = useState(false);

  // Total steps for dot generation
  const totalSteps = Math.max(1, Math.round((max - min) / step));
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const calculateValueFromPointer = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const thumbRadius = 13;
    const usableWidth = rect.width - thumbRadius * 2;
    if (usableWidth <= 0) return;
    const offsetX = clientX - rect.left - thumbRadius;
    const ratio = Math.max(0, Math.min(1, offsetX / usableWidth));
    const rawValue = min + ratio * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clamped = Math.max(min, Math.min(max, steppedValue));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      calculateValueFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  const isModified = defaultValue !== undefined && value !== defaultValue;
  const isCircleExpanded = isThumbHovered || isDragging;

  return (
    <div className="flex flex-col gap-2.5 select-none">
      {/* Label and Value Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Reset button if modified */}
          {isModified && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer"
              title={`Reset to default (${defaultValue}${unit})`}
              aria-label={`Reset to default (${defaultValue}${unit})`}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg text-[var(--text-main)] bg-[var(--surface-subtle)]">
            {value}
            {unit}
          </span>
        </div>
      </div>

      {/* Slider Track Area */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel || label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative h-8 flex items-center cursor-pointer select-none touch-none outline-none my-0.5"
      >
        {/* Track Bar Background */}
        <div className="absolute left-[13px] right-[13px] h-[22px] bg-[var(--surface-active)] rounded-full overflow-hidden">
          {/* Active Fill with smooth ease-out left/right transition */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: accentColor,
              transition: isDragging
                ? 'width 150ms cubic-bezier(0.16, 1, 0.3, 1)'
                : 'width 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Step Dots along the track (intermediate steps only) */}
        <div className="absolute left-[13px] right-[13px] h-[22px] flex items-center pointer-events-none">
          {Array.from({ length: totalSteps + 1 }).map((_, i) => {
            if (i === 0 || i === totalSteps) return null;
            const dotValue = min + i * step;
            const isPassed = dotValue <= value;
            const dotLeft = (i / totalSteps) * 100;
            return (
              <span
                key={i}
                className={`absolute -translate-x-1/2 w-1 h-1 rounded-full transition-colors duration-200 ease-out ${
                  isPassed ? 'bg-white/45' : 'bg-white/15'
                }`}
                style={{ left: `${dotLeft}%` }}
              />
            );
          })}
        </div>

        {/* White Circular Thumb - smooth ease-out snap to nearest circle on drag & hover growth */}
        <div
          onMouseEnter={() => setIsThumbHovered(true)}
          onMouseLeave={() => setIsThumbHovered(false)}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[26px] h-[26px] rounded-full bg-white shadow-md shadow-black/35 cursor-grab active:cursor-grabbing pointer-events-auto select-none hover:scale-125 ${
            isCircleExpanded ? 'scale-125' : 'scale-100'
          }`}
          style={{
            left: `calc(13px + (${percent} * (100% - 26px) / 100))`,
            transition: isDragging
              ? 'left 150ms cubic-bezier(0.16, 1, 0.3, 1), scale 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'left 220ms cubic-bezier(0.16, 1, 0.3, 1), scale 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Range Min/Max Footnote */}
      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-tertiary)] px-3 -mt-0.5">
        <span>
          {min}
          {unit}
        </span>
        {defaultValue !== undefined && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Click to reset"
          >
            Default ({defaultValue}
            {unit})
          </button>
        )}
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
