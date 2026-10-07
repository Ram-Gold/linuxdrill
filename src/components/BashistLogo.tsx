interface BashistLogoProps {
  className?: string;
  variant?: "solid" | "subtle" | "dark";
}

/**
 * BashistLogo — Brand SVG logo featuring the iconic `> _ <` bash face.
 * Automatically reflects active theme presets and dark/light mode tokens.
 */
export default function BashistLogo({
  className = "w-7 h-7",
  variant = "solid",
}: BashistLogoProps) {
  if (variant === "subtle") {
    return (
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-hidden="true"
      >
        <rect
          x="56"
          y="56"
          width="888"
          height="888"
          rx="72"
          ry="72"
          fill="var(--surface-subtle)"
          stroke="var(--accent-primary)"
          strokeWidth="32"
          className="transition-colors duration-200"
        />
        {/* Left Eye > */}
        <path
          d="M 132 327 L 360 421 L 360 475 L 132 569 L 132 513 L 291 448 L 132 383 Z"
          fill="var(--accent-primary)"
          className="transition-colors duration-200"
        />
        {/* Right Eye < */}
        <path
          d="M 868 327 L 640 421 L 640 475 L 868 569 L 868 513 L 709 448 L 868 383 Z"
          fill="var(--accent-primary)"
          className="transition-colors duration-200"
        />
        {/* Mouth _ */}
        <rect
          x="382"
          y="653"
          width="236"
          height="56"
          rx="6"
          fill="var(--accent-primary)"
          className="transition-colors duration-200"
        />
      </svg>
    );
  }

  if (variant === "dark") {
    return (
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-hidden="true"
      >
        <rect
          x="56"
          y="56"
          width="888"
          height="888"
          rx="72"
          ry="72"
          fill="#000000"
          className="transition-colors duration-200"
        />
        <path
          d="M 132 327 L 360 421 L 360 475 L 132 569 L 132 513 L 291 448 L 132 383 Z"
          fill="#ffffff"
        />
        <path
          d="M 868 327 L 640 421 L 640 475 L 868 569 L 868 513 L 709 448 L 868 383 Z"
          fill="#ffffff"
        />
        <rect x="382" y="653" width="236" height="56" rx="6" fill="#ffffff" />
      </svg>
    );
  }

  // Default: "solid" theme-reactive logo
  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Background squircle that adapts to active theme preset primary accent */}
      <rect
        x="56"
        y="56"
        width="888"
        height="888"
        rx="72"
        ry="72"
        fill="var(--accent-primary)"
        className="transition-colors duration-200"
      />
      {/* Left Eye > */}
      <path
        d="M 132 327 L 360 421 L 360 475 L 132 569 L 132 513 L 291 448 L 132 383 Z"
        fill="var(--text-main, #ffffff)"
        className="transition-colors duration-200"
      />
      {/* Right Eye < */}
      <path
        d="M 868 327 L 640 421 L 640 475 L 868 569 L 868 513 L 709 448 L 868 383 Z"
        fill="var(--text-main, #ffffff)"
        className="transition-colors duration-200"
      />
      {/* Mouth _ */}
      <rect
        x="382"
        y="653"
        width="236"
        height="56"
        rx="6"
        fill="var(--text-main, #ffffff)"
        className="transition-colors duration-200"
      />
    </svg>
  );
}
