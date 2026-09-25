import confetti from "canvas-confetti";

export function fireSuccessConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Realistic multi-stage explosion
  fire(0.25, {
    spread: 30,
    startVelocity: 55,
    colors: ["#10B981", "#06B6D4", "#3B82F6", "#F59E0B"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#34D399", "#38BDF8", "#818CF8", "#F472B6"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Continuous twin-cannon celebration for extra grandeur
export function fireGrandCelebration() {
  fireSuccessConfetti();

  const duration = 1500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 99999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 40 * (timeLeft / duration);
    // Left side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.15, y: 0.55 },
      colors: ["#10B981", "#06B6D4", "#60A5FA", "#FBBF24", "#F472B6", "#A78BFA"],
    });
    // Right side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.85, y: 0.55 },
      colors: ["#10B981", "#06B6D4", "#60A5FA", "#FBBF24", "#F472B6", "#A78BFA"],
    });
  }, 220);
}
