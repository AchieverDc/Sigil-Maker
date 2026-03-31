// ========== VALIDATION & ERROR HANDLING ==========
class ValidationError extends Error {
  constructor(message, type = "validation") {
    super(message);
    this.name = "ValidationError";
    this.type = type;
  }
}
class ProcessingError extends Error {
  constructor(message, type = "processing") {
    super(message);
    this.name = "ProcessingError";
    this.type = type;
  }
}

// ========== CORE LOGIC ==========
const letterToNumber = (char) => {
  const code = char.charCodeAt(0);
  if (code < 65 || code > 90)
    throw new ProcessingError(`Invalid character code: ${code}`);
  return code - 64;
};

const digitalRoot = (n) => {
  if (typeof n !== "number" || isNaN(n) || n <= 0)
    throw new ProcessingError(`Invalid number: ${n}`);
  return n % 9 === 0 ? 9 : n % 9;
};

const textToPositions = (text) => {
  if (typeof text !== "string")
    throw new ValidationError("Input must be a string");
  const cleaned = text.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length === 0)
    throw new ValidationError("No alphabetic characters found");
  if (cleaned.length > 5000)
    throw new ValidationError("Input too long (max 5000 letters)");
  return Array.from(cleaned).map((char) => letterToNumber(char));
};

// Extract Consonants (Strip Vowels including Y) - MAIN METHOD
const extractConsonants = (text) => {
  if (typeof text !== "string")
    throw new ValidationError("Input must be a string");
  const consonantsOnly = text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/[AEIOUY]/g, "");
  if (consonantsOnly.length === 0)
    throw new ValidationError(
      "No consonants found (vowels A, E, I, O, U, Y removed)",
    );
  return consonantsOnly;
};

const keepFirstOccurrenceOnly = (items) => {
  if (!Array.isArray(items))
    throw new ProcessingError("Input must be an array");
  if (items.length === 0)
    return { unique: [], duplicates: [], uniqueCount: 0, duplicateCount: 0 };
  const seen = new Set();
  const unique = [];
  const duplicates = [];
  for (const item of items) {
    if (typeof item !== "string" && (typeof item !== "number" || isNaN(item))) {
      console.warn(`Skipping invalid item: ${item}`);
      continue;
    }
    if (!seen.has(item)) {
      seen.add(item);
      unique.push(item);
    } else {
      duplicates.push(item);
    }
  }
  return {
    unique,
    duplicates,
    uniqueCount: unique.length,
    duplicateCount: duplicates.length,
  };
};

const positionsToDigits = (positions) => {
  if (!Array.isArray(positions))
    throw new ProcessingError("Positions must be an array");
  return positions.map((n) => digitalRoot(n));
};

const calculateMasterSigil = (digits) => {
  if (!Array.isArray(digits))
    throw new ProcessingError("Digits must be an array");
  if (digits.length === 0)
    throw new ProcessingError("No digits to calculate master sigil");
  const sum = digits.reduce((acc, curr) => {
    if (typeof curr !== "number" || isNaN(curr))
      throw new ProcessingError(`Invalid digit: ${curr}`);
    return acc + curr;
  }, 0);
  return { sum, masterNumber: digitalRoot(sum) };
};

// ========== SACRED GEOMETRY CALCULATIONS ==========
const distance = (p1, p2) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const vectorAngle = (p1, p2) => {
  const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  let angleDeg = angleRad * (180 / Math.PI);
  return angleDeg < 0 ? angleDeg + 360 : angleDeg;
};

const isSacredRatio = (ratio, target, tolerance = 0.02) =>
  Math.abs(ratio - target) / target < tolerance;

const calculateSacredGeometry = (
  pathPoints,
  numberPositions,
  canvasWidth,
  canvasHeight,
) => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.38;

  let segments = [];
  let totalLength = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    const segLength = distance(p1, p2);
    segments.push(segLength);
    totalLength += segLength;
  }
  const avgSegment =
    segments.length > 0 ? (totalLength / segments.length).toFixed(1) : "0.0";
  const startAngle =
    pathPoints.length > 0
      ? `${vectorAngle({ x: centerX, y: centerY }, pathPoints[0]).toFixed(1)}°`
      : "-";
  const endAngle =
    pathPoints.length > 1
      ? `${vectorAngle({ x: centerX, y: centerY }, pathPoints[pathPoints.length - 1]).toFixed(1)}°`
      : "-";

  let goldenRatioDetected = "None";
  let sqrt2Detected = "None";
  for (let i = 0; i < segments.length - 1; i++) {
    const ratio = segments[i + 1] / segments[i];
    if (isSacredRatio(ratio, 1.618) || isSacredRatio(ratio, 0.618)) {
      goldenRatioDetected = `Seg ${i + 1}/${i + 2} = ${ratio.toFixed(3)}`;
    }
    if (isSacredRatio(ratio, 1.414) || isSacredRatio(ratio, 0.707)) {
      sqrt2Detected = `Seg ${i + 1}/${i + 2} = ${ratio.toFixed(3)}`;
    }
  }

  const complexity =
    pathPoints.length > 0
      ? `${Math.min(Math.round((pathPoints.length / 9) * 10), 10)}/10`
      : "0/10";

  return {
    path: {
      totalLength: `${totalLength.toFixed(1)}px`,
      segmentCount: segments.length > 0 ? segments.length : "0",
      avgSegment: `${avgSegment}px`,
      startAngle,
      endAngle,
    },
    ratios: {
      golden: goldenRatioDetected,
      sqrt2: sqrt2Detected,
    },
    energetic: {
      complexity,
      intersections: "0",
    },
  };
};

// FIXED: Safe DOM element access to prevent null reference errors
const safeSetText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

const updateMeasurementsDisplay = (measurements) => {
  // Only update elements that exist in the simplified HTML
  safeSetText("pathLength", measurements.path.totalLength);
  safeSetText("segmentCount", measurements.path.segmentCount);
  safeSetText("avgSegment", measurements.path.avgSegment);
  safeSetText("startAngle", measurements.path.startAngle);
  safeSetText("endAngle", measurements.path.endAngle);
  safeSetText("goldenRatio", measurements.ratios.golden);
  safeSetText("sqrt2Ratio", measurements.ratios.sqrt2);
  safeSetText("complexity", measurements.energetic.complexity);
  safeSetText("intersectionCount", measurements.energetic.intersections);
};

// ========== SIGIL VISUALIZATION ==========
const calculateCirclePositions = (centerX, centerY, radius) => {
  const positions = {};
  const startAngle = -Math.PI / 2;
  for (let num = 1; num <= 9; num++) {
    const angle = startAngle + ((num - 1) * 40 * Math.PI) / 180;
    positions[num] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle * (180 / Math.PI),
    };
  }
  return positions;
};

const findLineIntersection = (p1, p2, p3, p4) => {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (Math.abs(denom) < 1e-10) return null;
  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  }
  return null;
};

const findPathIntersections = (pathPoints) => {
  const intersections = [];
  for (let i = 0; i < pathPoints.length - 2; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    for (let j = i + 2; j < pathPoints.length - 1; j++) {
      if (j === i + 1) continue;
      if (i === 0 && j === pathPoints.length - 2) continue;
      const p3 = pathPoints[j];
      const p4 = pathPoints[j + 1];
      const intersection = findLineIntersection(p1, p2, p3, p4);
      if (intersection) {
        const angle1 = vectorAngle(p1, p2);
        const angle2 = vectorAngle(p3, p4);
        const diff = Math.abs(angle1 - angle2);
        const intersectionAngle = Math.min(diff, 360 - diff);
        intersections.push({
          point: intersection,
          segments: [i, j],
          angle: intersectionAngle.toFixed(1),
        });
      }
    }
  }
  return intersections;
};

// UPDATED: Removed purple concentric circles, displays only digits 1-9
const drawStaticBackground = (
  ctx,
  centerX,
  centerY,
  radius,
  numberPositions,
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw Number Positions (1-9) - No background circles
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let num = 1; num <= 9; num++) {
    const pos = numberPositions[num];

    // Draw Number
    ctx.font = `bold ${Math.max(30, radius / 8.5)}px Arial`;
    ctx.fillStyle = "#e6e1ff";
    ctx.shadowColor = `rgba(108, 92, 231, 0.9)`;
    ctx.shadowBlur = 18;
    ctx.fillText(num.toString(), pos.x, pos.y);
    ctx.shadowBlur = 0;

    // Stroke for clarity
    ctx.strokeStyle = "#1a1825";
    ctx.lineWidth = 3.5;
    ctx.strokeText(num.toString(), pos.x, pos.y);
    ctx.strokeStyle = "#6c5ce7";
    ctx.lineWidth = 2;
    ctx.strokeText(num.toString(), pos.x, pos.y);

    // Small dot under number for anchor point
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(108, 92, 231, 0.5)";
    ctx.fill();
  }

  // Center decorative element
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.06, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.35)";
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Background stars/particles
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius * (0.4 + Math.random() * 0.58);
    const x = centerX + dist * Math.cos(angle);
    const y = centerY + dist * Math.sin(angle);
    const size = Math.random() * 3.5 + 1.2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.25})`;
    ctx.fill();
  }
};

const drawStar = (
  ctx,
  x,
  y,
  outerRadius,
  innerRadius,
  points,
  fillColor,
  strokeColor,
) => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const xPos = x + Math.cos(angle) * r;
    const yPos = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(xPos, yPos);
    else ctx.lineTo(xPos, yPos);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.shadowColor = "rgba(255, 209, 102, 0.95)";
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.shadowBlur = 0;
};

const animateSigilPath = (ctx, pathPoints, numberPositions, options = {}) => {
  const {
    showIntersections = true,
    onAnimationComplete = () => {},
    centerX,
    centerY,
    radius,
    canvasWidth,
    canvasHeight,
  } = options;
  let currentSegment = 0;
  let progress = 0;
  let animationId = null;
  let isAnimating = true;
  const animationSpeed = 0.012;
  const intersections = showIntersections
    ? findPathIntersections(pathPoints)
    : [];
  const measurements = calculateSacredGeometry(
    pathPoints,
    numberPositions,
    canvasWidth,
    canvasHeight,
  );
  measurements.energetic.intersections = intersections.length.toString();
  updateMeasurementsDisplay(measurements);
  document.getElementById("canvasOverlay")?.classList.add("active");
  document.getElementById("animationStatus")?.classList.add("active");
  const animateBtn = document.getElementById("animateBtn");
  const resetBtn = document.getElementById("resetBtn");
  if (animateBtn) animateBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;

  const animate = () => {
    if (!isAnimating) {
      cancelAnimationFrame(animationId);
      return;
    }
    drawStaticBackground(ctx, centerX, centerY, radius, numberPositions);

    if (currentSegment > 0) {
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let i = 0; i < currentSegment; i++) {
        ctx.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
      }
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = Math.max(5.5, radius / 42);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    if (currentSegment < pathPoints.length - 1) {
      const start = pathPoints[currentSegment];
      const end = pathPoints[currentSegment + 1];
      const currentX = start.x + (end.x - start.x) * progress;
      const currentY = start.y + (end.y - start.y) * progress;
      ctx.beginPath();
      if (currentSegment === 0) ctx.moveTo(start.x, start.y);
      else
        ctx.moveTo(pathPoints[currentSegment].x, pathPoints[currentSegment].y);
      ctx.lineTo(currentX, currentY);
      const gradient = ctx.createLinearGradient(
        start.x,
        start.y,
        currentX,
        currentY,
      );
      gradient.addColorStop(0, "rgba(255, 209, 102, 0.45)");
      gradient.addColorStop(1, "#ffd166");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(5.5, radius / 42) * 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(currentX, currentY, Math.max(9, radius / 32), 0, 2 * Math.PI);
      ctx.fillStyle = "#ff6b6b";
      ctx.fill();
      ctx.strokeStyle = "#ff5252";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowColor = "rgba(255, 107, 107, 0.95)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = "#6c5ce7";
    for (let i = 0; i <= currentSegment; i++) {
      const point = pathPoints[i];
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#5a4fcf";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (pathPoints.length > 0) {
      const startPoint = pathPoints[0];
      ctx.beginPath();
      ctx.arc(
        startPoint.x,
        startPoint.y,
        Math.max(14, radius / 20),
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = "#ff6b6b";
      ctx.fill();
      ctx.strokeStyle = "#ff5252";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowColor = "rgba(255, 107, 107, 0.95)";
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = `bold ${Math.max(16, radius / 14)}px Arial`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("α", startPoint.x, startPoint.y);
    }
    if (currentSegment >= pathPoints.length - 1 && pathPoints.length > 1) {
      const endPoint = pathPoints[pathPoints.length - 1];
      drawStar(
        ctx,
        endPoint.x,
        endPoint.y,
        Math.max(16, radius / 18),
        Math.max(7, radius / 42),
        5,
        "#ffd166",
        "#e6b400",
      );
      ctx.font = `bold ${Math.max(18, radius / 12)}px Arial`;
      ctx.fillStyle = "#1a1825";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ω", endPoint.x, endPoint.y);
    }
    progress += animationSpeed;
    if (progress >= 1) {
      progress = 0;
      currentSegment++;
      updateSequenceHighlight(currentSegment);
      if (currentSegment >= pathPoints.length - 1) {
        cancelAnimationFrame(animationId);
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = Math.max(5.5, radius / 42);
        ctx.stroke();
        ctx.fillStyle = "#6c5ce7";
        for (let i = 0; i < pathPoints.length; i++) {
          const point = pathPoints[i];
          ctx.beginPath();
          ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#5a4fcf";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        const startPoint = pathPoints[0];
        ctx.beginPath();
        ctx.arc(
          startPoint.x,
          startPoint.y,
          Math.max(14, radius / 20),
          0,
          2 * Math.PI,
        );
        ctx.fillStyle = "#ff6b6b";
        ctx.fill();
        ctx.strokeStyle = "#ff5252";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.font = `bold ${Math.max(16, radius / 14)}px Arial`;
        ctx.fillStyle = "white";
        ctx.fillText("α", startPoint.x, startPoint.y);
        if (pathPoints.length > 1) {
          const endPoint = pathPoints[pathPoints.length - 1];
          drawStar(
            ctx,
            endPoint.x,
            endPoint.y,
            Math.max(16, radius / 18),
            Math.max(7, radius / 42),
            5,
            "#ffd166",
            "#e6b400",
          );
          ctx.font = `bold ${Math.max(18, radius / 12)}px Arial`;
          ctx.fillStyle = "#1a1825";
          ctx.fillText("ω", endPoint.x, endPoint.y);
        }
        if (showIntersections && intersections.length > 0) {
          ctx.fillStyle = "#06d6a0";
          for (const { point, angle } of intersections) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(9, radius / 26), 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "#05a87c";
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.shadowColor = "rgba(6, 214, 160, 0.95)";
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.font = `bold ${Math.max(12, radius / 28)}px Arial`;
            ctx.fillStyle = "#ffd166";
            ctx.fillText(
              `${angle}°`,
              point.x,
              point.y - Math.max(20, radius / 14),
            );
          }
        }
        document.getElementById("canvasOverlay")?.classList.remove("active");
        document.getElementById("animationStatus")?.classList.remove("active");
        if (animateBtn) animateBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = false;
        onAnimationComplete(intersections);
        return;
      }
    }
    animationId = requestAnimationFrame(animate);
  };
  animate();
  return {
    stop: () => {
      isAnimating = false;
      if (animationId) cancelAnimationFrame(animationId);
      document.getElementById("canvasOverlay")?.classList.remove("active");
      document.getElementById("animationStatus")?.classList.remove("active");
      if (animateBtn) animateBtn.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
    },
  };
};

const updateSequenceHighlight = (currentIndex) => {
  document
    .querySelectorAll("#sequenceContainer .sequence-label")
    .forEach((label, index) => {
      label.classList.toggle("active", index === currentIndex);
    });
};

const formatArray = (arr, maxItems = 15) => {
  if (!Array.isArray(arr)) return "-";
  if (arr.length === 0) return "None";
  if (arr.length <= maxItems) return arr.join(", ");
  return `${arr.slice(0, maxItems).join(", ")}, ... (${arr.length - maxItems} more)`;
};

const createSequenceLabels = (digits) => {
  const container = document.getElementById("sequenceContainer");
  if (!container) return;
  container.innerHTML = "";
  if (digits.length === 0) {
    container.innerHTML =
      '<div style="color: #b8a9d4; width: 100%; text-align: center; padding: 20px; font-size: 1.2rem;">No digits to display</div>';
    return;
  }
  digits.forEach((digit, index) => {
    const label = document.createElement("div");
    label.className = `sequence-label${index === 0 ? " active" : ""}`;
    label.textContent = digit;
    container.appendChild(label);
  });
};

const updateIntersectionDisplay = (intersections, pathPoints, digits) => {
  const listElement = document.getElementById("intersectionList");
  if (!listElement) return;
  if (intersections.length === 0) {
    listElement.innerHTML =
      "<li>No energetic convergence points detected in this sigil</li>";
    return;
  }
  let html = "";
  intersections.forEach((intersection, index) => {
    const seg1 = intersection.segments[0];
    const seg2 = intersection.segments[1];
    const digit1Start = digits[seg1];
    const digit1End = digits[seg1 + 1];
    const digit2Start = digits[seg2];
    const digit2End = digits[seg2 + 1];
    html += `<li>Convergence ${index + 1}: Path <span class="intersection-highlight">${digit1Start}→${digit1End}</span> crosses <span class="intersection-highlight">${digit2Start}→${digit2End}</span> at <span class="sacred-highlight">${intersection.angle}°</span></li>`;
  });
  listElement.innerHTML = html;
};

// ========== UI HELPERS ==========
const showNotification = (message, type = "success") => {
  const notification = document.getElementById("notification");
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  setTimeout(() => notification.classList.remove("show"), 4200);
};

const showError = (message) => {
  const errorElement = document.getElementById("inputError");
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.add("show");
  setTimeout(() => errorElement.classList.remove("show"), 6200);
};

const hideError = () => {
  document.getElementById("inputError")?.classList.remove("show");
};

const setLoading = (isLoading) => {
  const button = document.getElementById("generate");
  const buttonText = document.getElementById("buttonText");
  if (!button || !buttonText) return;
  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
    buttonText.innerHTML = '<span class="spinner"></span>Sacred Calculation...';
  } else {
    button.classList.remove("loading");
    button.disabled = false;
    buttonText.textContent = "Generate Sacred Sigil";
    button.style.background =
      "linear-gradient(135deg, var(--all-letters-primary) 0%, var(--all-letters-secondary) 100%)";
  }
};

const updateCharCount = (text) => {
  const charCountEl = document.getElementById("charCount");
  const consonantCountEl = document.getElementById("consonantCount");
  if (!charCountEl || !consonantCountEl) return;
  const totalChars = text.length;
  const alphaChars = text.replace(/[^a-zA-Z]/g, "").length;
  charCountEl.textContent = `${totalChars}/10000 characters`;
  charCountEl.className = "char-count";
  if (totalChars > 8000) charCountEl.classList.add("warning");
  else if (totalChars > 5000) charCountEl.classList.add("good");
  const consonants = text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/[AEIOUY]/g, "");
  consonantCountEl.textContent = `${consonants.length} consonants`;
};

const setupDownloadButton = () => {
  document.getElementById("downloadBtn")?.addEventListener("click", () => {
    try {
      const canvas = document.getElementById("sigilCanvas");
      if (!canvas) return;
      const scale = 2;
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(canvas, 0, 0);
      const link = document.createElement("a");
      link.download = `sacred-sigil-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
      link.href = tempCanvas.toDataURL("image/png", 1.0);
      link.click();
      showNotification(
        "Sacred sigil downloaded in high resolution!",
        "success",
      );
    } catch (error) {
      console.error("Download error:", error);
      showNotification("Failed to download sigil. Try again.", "error");
    }
  });
};

// ========== MAIN PROCESSING ==========
let currentAnimation = null;
let currentPathPoints = [];
let currentDigits = [];
let currentNumberPositions = null;
let currentCanvasData = null;
let currentMeasurements = null;

const generateSigilSequence = (text, options = {}) => {
  const { showSteps = false } = options;
  const steps = [];
  try {
    // CONSONANT REDUCTION METHOD (Main Process)
    const consonantsOnly = extractConsonants(text);
    if (showSteps) {
      steps.push({
        step: "Stage 1a: Extract Consonants",
        detail: `Removed all vowels (A, E, I, O, U, Y). Kept only consonants.\n${consonantsOnly.length} consonants remain.\nExample: "THE MONEY" → "THMNY"`,
        type: "success",
      });
    }
    const consonantDedupResult = keepFirstOccurrenceOnly(
      consonantsOnly.split(""),
    );
    const {
      unique: uniqueConsonants,
      uniqueCount: consUniqueCount,
      duplicateCount: consDuplicateCount,
    } = consonantDedupResult;
    if (showSteps) {
      const consSample = consonantsOnly.slice(0, 25);
      const uniqueConsSample = uniqueConsonants.slice(0, 25).join("");
      steps.push({
        step: "Stage 1b: Remove Duplicate Consonants",
        detail: `Keep only FIRST occurrence of each consonant.\nAll subsequent duplicates eliminated.\nConsonants: "${consSample}${consonantsOnly.length > 25 ? "..." : ""}"\nAfter deduplication: "${uniqueConsSample}"\n${consUniqueCount} unique consonants remain (${consDuplicateCount} removed)`,
        type: "success",
      });
    }
    const positions = uniqueConsonants.map((c) => letterToNumber(c));
    const posSample = positions.slice(0, 15).join(", ");
    if (showSteps) {
      steps.push({
        step: "Stage 2a: Convert Consonants to Positions",
        detail: `Convert each unique consonant to its alphabet position.\nConsonants: [${uniqueConsonants.slice(0, 15).join(", ")}${uniqueConsonants.length > 15 ? "..." : ""}]\nPositions: [${positions
          .slice(0, 15)
          .map((p, i) => `${uniqueConsonants[i]}=${p}`)
          .join(", ")}]`,
        type: "success",
      });
    }
    const digitsAfterRoot = positionsToDigits(positions);
    if (showSteps) {
      const digSample = digitsAfterRoot.slice(0, 15).join(", ");
      steps.push({
        step: "Stage 2b: Digital Root Reduction",
        detail: `Convert each position to single digit (1-9).\nPositions: [${posSample}]\nDigits:     [${digSample}]`,
        type: "success",
      });
    }
    const digitDedupResult = keepFirstOccurrenceOnly(digitsAfterRoot);
    const {
      unique: uniqueDigits,
      uniqueCount: digUniqueCount,
      duplicateCount: digDuplicateCount,
    } = digitDedupResult;
    if (showSteps) {
      const digSample = digitsAfterRoot.slice(0, 20).join(", ");
      const uniqueDigSample = uniqueDigits.slice(0, 20).join(", ");
      steps.push({
        step: "Stage 2c: Remove Duplicate Digits",
        detail: `Keep only FIRST occurrence of each digit (1-9).\nAll subsequent duplicates eliminated.\nDigits: [${digSample}]\nAfter deduplication: [${uniqueDigSample}]\n${digUniqueCount} unique digits remain (${digDuplicateCount} removed)`,
        type: "success",
      });
    }
    const { sum, masterNumber } = calculateMasterSigil(uniqueDigits);
    if (showSteps) {
      const digitsStr = uniqueDigits.join(" + ");
      steps.push({
        step: "Stage 3a: Sum Final Unique Digits",
        detail: `Add all remaining unique digits together:\n${digitsStr} = ${sum}`,
        type: "success",
      });
      steps.push({
        step: "Stage 3b: Master Sigil (Final Reduction)",
        detail: `Reduce sum to single digit:\n${sum} → ${masterNumber}`,
        type: "success",
      });
    }
    return {
      success: true,
      masterSigil: masterNumber,
      uniqueElements: uniqueConsonants,
      uniqueDigits: uniqueDigits,
      sum: sum,
      steps: steps,
      stats: {
        inputLetters: text.replace(/[^a-zA-Z]/g, "").length,
        processedCount: consonantsOnly.length,
        uniqueCount: consUniqueCount,
        finalDigits: digUniqueCount,
      },
    };
  } catch (error) {
    console.error("Sigil generation error:", error);
    steps.push({
      step: "Error",
      detail: `Type: ${error.name}\nMessage: ${error.message}\nPlease check your input and try again.`,
      type: "error",
    });
    return { success: false, error: error, steps: steps, stats: {} };
  }
};

const drawSigilStatic = (digits, canvasId, showIntersections = true) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.38;
  const numberPositions = calculateCirclePositions(centerX, centerY, radius);
  drawStaticBackground(ctx, centerX, centerY, radius, numberPositions);
  let pathPoints = [];
  let intersections = [];
  if (digits.length >= 2) {
    pathPoints = digits.map((digit) => numberPositions[digit]);
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = Math.max(5.5, radius / 42);
    ctx.stroke();
    ctx.fillStyle = "#6c5ce7";
    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#5a4fcf";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const startPoint = pathPoints[0];
    ctx.beginPath();
    ctx.arc(
      startPoint.x,
      startPoint.y,
      Math.max(14, radius / 20),
      0,
      2 * Math.PI,
    );
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.font = `bold ${Math.max(16, radius / 14)}px Arial`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("α", startPoint.x, startPoint.y);
    const endPoint = pathPoints[pathPoints.length - 1];
    drawStar(
      ctx,
      endPoint.x,
      endPoint.y,
      Math.max(16, radius / 18),
      Math.max(7, radius / 42),
      5,
      "#ffd166",
      "#e6b400",
    );
    ctx.font = `bold ${Math.max(18, radius / 12)}px Arial`;
    ctx.fillStyle = "#1a1825";
    ctx.fillText("ω", endPoint.x, endPoint.y);
    if (showIntersections) {
      intersections = findPathIntersections(pathPoints);
      ctx.fillStyle = "#06d6a0";
      for (const { point, angle } of intersections) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(9, radius / 26), 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#05a87c";
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.shadowColor = "rgba(6, 214, 160, 0.95)";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = `bold ${Math.max(12, radius / 28)}px Arial`;
        ctx.fillStyle = "#ffd166";
        ctx.fillText(`${angle}°`, point.x, point.y - Math.max(20, radius / 14));
      }
    }
  } else if (digits.length === 1) {
    const pos = numberPositions[digits[0]];
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(18, radius / 16), 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#e6b400";
    ctx.lineWidth = 5;
    ctx.stroke();
    drawStar(
      ctx,
      pos.x,
      pos.y,
      Math.max(20, radius / 14),
      Math.max(9, radius / 32),
      5,
      "#ffd166",
      "#e6b400",
    );
    ctx.font = `bold ${Math.max(22, radius / 10)}px Arial`;
    ctx.fillStyle = "#1a1825";
    ctx.fillText("ω", pos.x, pos.y);
  }
  currentPathPoints = pathPoints;
  currentDigits = digits;
  currentNumberPositions = numberPositions;
  currentCanvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  currentMeasurements = calculateSacredGeometry(
    pathPoints,
    numberPositions,
    canvas.width,
    canvas.height,
  );
  currentMeasurements.energetic.intersections = intersections.length.toString();
  updateMeasurementsDisplay(currentMeasurements);
  return {
    pathPoints,
    intersections,
    numberPositions,
    measurements: currentMeasurements,
  };
};

// ========== FIXED: displayResults with safe DOM access and corrected regex ==========
const displayResults = (result) => {
  if (currentAnimation) {
    currentAnimation.stop();
    currentAnimation = null;
  }
  safeSetText("positionsSequence", "-");
  document.getElementById("positionsSequence")?.classList.remove("error");
  safeSetText("digitsSequence", "-");
  document.getElementById("digitsSequence")?.classList.remove("error");
  safeSetText("result", "-");
  document.getElementById("result")?.classList.remove("error");
  safeSetText("sumDisplay", "-");
  const stepsContainer = document.getElementById("stepsContainer");
  const sequenceContainer = document.getElementById("sequenceContainer");
  const intersectionList = document.getElementById("intersectionList");
  if (stepsContainer) stepsContainer.innerHTML = "";
  if (sequenceContainer) sequenceContainer.innerHTML = "";
  if (intersectionList)
    intersectionList.innerHTML =
      "<li>Generate sigil to see sacred intersections</li>";

  if (!result.success) {
    safeSetText("result", "ERROR");
    document.getElementById("result")?.classList.add("error");
    showNotification(result.error?.message || "An error occurred", "error");
    if (stepsContainer) {
      const stepElement = document.createElement("div");
      stepElement.className = `step error`;
      stepElement.innerHTML = `<span class="step-number">Error:</span><div class="step-detail">${result.steps?.[0]?.detail.replace(/\n/g, "<br>")}</div>`;
      stepsContainer.appendChild(stepElement);
    }
    const canvas = document.getElementById("sigilCanvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ["pathLength", "segmentCount", "goldenRatio"].forEach((id) =>
      safeSetText(id, "-"),
    );
    return;
  }

  const { masterSigil, uniqueElements, uniqueDigits, sum, steps, stats } =
    result;
  safeSetText("positionsSequence", formatArray(uniqueElements, 20));
  safeSetText("digitsSequence", uniqueDigits.join(" → "));
  safeSetText("result", masterSigil);
  safeSetText("sumDisplay", `${sum} → ${masterSigil}`);
  safeSetText("letterCount", stats.inputLetters);
  safeSetText("processedCount", stats.processedCount);
  safeSetText("uniqueCount", stats.uniqueCount);
  safeSetText("finalDigits", stats.finalDigits);
  createSequenceLabels(uniqueDigits);

  if (stepsContainer && steps) {
    steps.forEach((step) => {
      const stepElement = document.createElement("div");
      stepElement.className = `step${step.type === "error" ? " error" : step.type === "success" ? " success" : ""}`;
      stepElement.innerHTML = `<span class="step-number">${step.step}:</span><div class="step-detail">${step.detail.replace(/\n/g, "<br>")}</div>`;
      stepsContainer.appendChild(stepElement);
    });
  }

  const showIntersections =
    document.getElementById("showIntersections")?.checked;
  const canvasResult = drawSigilStatic(
    uniqueDigits,
    "sigilCanvas",
    showIntersections,
  );
  if (canvasResult && showIntersections) {
    updateIntersectionDisplay(
      canvasResult.intersections,
      canvasResult.pathPoints,
      uniqueDigits,
    );
  } else if (intersectionList) {
    intersectionList.innerHTML = "<li>Intersection display disabled</li>";
  }
  showNotification(
    `Sacred Sigil ${masterSigil} generated with geometric precision!`,
    "success",
  );
};

// ========== EVENT HANDLERS ==========
document.addEventListener("DOMContentLoaded", () => {
  let isProcessing = false;
  let lastProcessedText = "";

  setupDownloadButton();

  const canvas = document.getElementById("sigilCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    const container = canvas.parentElement;
    if (!container) return;
    const size = Math.min(container.clientWidth - 70, 600);
    canvas.width = size;
    canvas.height = size;
    if (lastProcessedText && !isProcessing && currentCanvasData) {
      ctx.putImageData(currentCanvasData, 0, 0);
      if (currentMeasurements && currentPathPoints.length > 0) {
        const newMeasurements = calculateSacredGeometry(
          currentPathPoints,
          currentNumberPositions,
          canvas.width,
          canvas.height,
        );
        newMeasurements.energetic.intersections =
          currentMeasurements.energetic.intersections;
        updateMeasurementsDisplay(newMeasurements);
      }
    }
  };
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  document.getElementById("animateBtn")?.addEventListener("click", () => {
    if (currentPathPoints.length < 2) {
      showNotification(
        "Need at least 2 digits for sacred animation",
        "warning",
      );
      return;
    }
    if (currentAnimation) currentAnimation.stop();
    document
      .querySelectorAll("#sequenceContainer .sequence-label")
      .forEach((label, index) => {
        label.classList.toggle("active", index === 0);
      });
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.38;
    currentAnimation = animateSigilPath(
      ctx,
      currentPathPoints,
      currentNumberPositions,
      {
        showIntersections:
          document.getElementById("showIntersections")?.checked,
        onAnimationComplete: (intersections) => {
          if (document.getElementById("showIntersections")?.checked) {
            updateIntersectionDisplay(
              intersections,
              currentPathPoints,
              currentDigits,
            );
          }
        },
        centerX,
        centerY,
        radius,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      },
    );
  });

  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (currentAnimation) {
      currentAnimation.stop();
      currentAnimation = null;
    }
    document
      .querySelectorAll("#sequenceContainer .sequence-label")
      .forEach((label, index) => {
        label.classList.toggle("active", index === 0);
      });
    if (currentCanvasData) ctx.putImageData(currentCanvasData, 0, 0);
    document.getElementById("canvasOverlay")?.classList.remove("active");
    document.getElementById("animationStatus")?.classList.remove("active");
    const animateBtn = document.getElementById("animateBtn");
    const resetBtn = document.getElementById("resetBtn");
    if (animateBtn) animateBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
    showNotification("Sacred animation reset", "success");
  });

  const affirmationInput = document.getElementById("affirmation");
  const showStepsCheckbox = document.getElementById("showSteps");
  const showIntersectionsCheckbox =
    document.getElementById("showIntersections");
  const autoProcessCheckbox = document.getElementById("autoProcess");

  const validateAndProcess = () => {
    hideError();
    const text = affirmationInput?.value.trim() || "";
    updateCharCount(text);
    if (!text) {
      showError("Please enter some text to process.");
      return false;
    }
    const alphaChars = text.replace(/[^a-zA-Z]/g, "");
    if (alphaChars.length === 0) {
      showError("Input must contain at least one letter (A-Z).");
      return false;
    }
    if (text.length > 10000) {
      showError("Input is too long (maximum 10,000 characters).");
      return false;
    }
    if (alphaChars.length > 5000) {
      showError("Too many letters (maximum 5,000 alphabetic characters).");
      return false;
    }
    const consonants = text
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .replace(/[AEIOUY]/g, "");
    if (consonants.length === 0) {
      showError(
        "No consonants found (vowels A, E, I, O, U, Y removed). Add consonants to your text.",
      );
      return false;
    }
    if (text === lastProcessedText) return false;
    return true;
  };

  const processSigil = () => {
    if (isProcessing) return;
    if (!validateAndProcess()) return;
    isProcessing = true;
    setLoading(true);
    const text = affirmationInput.value.trim();
    const options = { showSteps: showStepsCheckbox?.checked };
    try {
      const result = generateSigilSequence(text, options);
      displayResults(result);
      lastProcessedText = text;
    } catch (error) {
      console.error("Processing error:", error);
      showError("An unexpected error occurred. Please try again.");
      showNotification("Sacred calculation failed", "error");
    } finally {
      setLoading(false);
      isProcessing = false;
    }
  };

  document.getElementById("generate")?.addEventListener("click", processSigil);
  affirmationInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) processSigil();
  });

  let inputTimeout;
  affirmationInput?.addEventListener("input", () => {
    updateCharCount(affirmationInput.value);
    if (autoProcessCheckbox?.checked && !isProcessing) {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        if (validateAndProcess()) processSigil();
      }, 1400);
    }
  });

  autoProcessCheckbox?.addEventListener("change", () => {
    if (autoProcessCheckbox.checked && affirmationInput?.value.trim())
      processSigil();
  });

  showIntersectionsCheckbox?.addEventListener("change", () => {
    if (lastProcessedText && !isProcessing) processSigil();
  });

  updateCharCount(affirmationInput?.value || "");
  setTimeout(processSigil, 500);
});
