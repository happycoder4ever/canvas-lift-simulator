const patternedBrush = () => {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 20; // fixed width
  patternCanvas.height = 4; // taller for less obvious tiling
  const pctx = patternCanvas.getContext("2d")!;

  // Base horizontal gradient (subtle)
  const gradient = pctx.createLinearGradient(0, 0, patternCanvas.width, 0);
  gradient.addColorStop(0, "#d0d0d0");
  gradient.addColorStop(0.5, "#d3d3d3");
  gradient.addColorStop(1, "#d5d5d5");
  pctx.fillStyle = gradient;
  pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  // Horizontal brushed lines with random offsets
  pctx.strokeStyle = "rgba(255,255,255,0.06)";
  pctx.lineWidth = 1;
  for (let y = 0; y < patternCanvas.height; y += 2) {
    const offset = Math.random() * 2 - 1;
    pctx.beginPath();
    pctx.moveTo(0, y + 0.5 + offset);
    pctx.lineTo(patternCanvas.width, y + 0.5 + offset);
    pctx.stroke();
  }

  // Subtle diagonal streaks
  pctx.strokeStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < 2; i++) {
    const xStart = Math.random() * patternCanvas.width;
    const xEnd = xStart + Math.random() * 8 - 4;
    pctx.beginPath();
    pctx.moveTo(xStart, 0);
    pctx.lineTo(xEnd, patternCanvas.height);
    pctx.stroke();
  }

  // Fade top and bottom edges slightly
  const fadeHeight = 2;
  const topFade = pctx.createLinearGradient(0, 0, 0, fadeHeight);
  topFade.addColorStop(0, "rgba(208,208,208,0)");
  topFade.addColorStop(1, "rgba(208,208,208,1)");
  pctx.fillStyle = topFade;
  pctx.fillRect(0, 0, patternCanvas.width, fadeHeight);

  const bottomFade = pctx.createLinearGradient(
    0,
    patternCanvas.height - fadeHeight,
    0,
    patternCanvas.height
  );
  bottomFade.addColorStop(0, "rgba(208,208,208,1)");
  bottomFade.addColorStop(1, "rgba(208,208,208,0)");
  pctx.fillStyle = bottomFade;
  pctx.fillRect(
    0,
    patternCanvas.height - fadeHeight,
    patternCanvas.width,
    fadeHeight
  );

  // Optional faint noise to reduce repetition
  for (let x = 0; x < patternCanvas.width; x++) {
    for (let y = 0; y < patternCanvas.height; y++) {
      const v = Math.random() * 5;
      pctx.fillStyle = `rgba(${v},${v},${v},0.02)`;
      pctx.fillRect(x, y, 1, 1);
    }
  }

  return (ctx: CanvasRenderingContext2D) =>
    ctx.createPattern(patternCanvas, "repeat")!;
};

export { patternedBrush };
