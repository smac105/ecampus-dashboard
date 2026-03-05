// Confetti Animation Utility
// Used for celebrating application and registration completion

function celebrateWithConfetti() {
  // Check if confetti library is loaded
  if (typeof confetti === 'undefined') {
    console.warn('Confetti library not loaded');
    return;
  }

  // Duration of the confetti animation
  const duration = 3 * 1000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Initial burst from center
  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.5, y: 0.5 }
  });

  // Continuous confetti rain
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from random positions at the top
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);

  // Add some colorful bursts
  setTimeout(() => {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#00ffff', '#80c342', '#000000']
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#00ffff', '#80c342', '#000000']
    });
  }, 500);
}
