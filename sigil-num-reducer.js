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

const extractVowels = (text) => {
  if (typeof text !== "string")
    throw new ValidationError("Input must be a string");
  const vowelsOnly = text.toUpperCase().replace(/[^AEIOUY]/g, "");
  if (vowelsOnly.length === 0)
    throw new ValidationError("No vowels found (vowels are A, E, I, O, U, Y)");
  return vowelsOnly;
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

  const circleRadius = radius.toFixed(1);
  const circumference = (2 * Math.PI * radius).toFixed(1);
  const area = (Math.PI * radius * radius).toFixed(1);

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
  let sqrt3Detected = "None";
  for (let i = 0; i < segments.length - 1; i++) {
    const ratio = segments[i + 1] / segments[i];
    if (isSacredRatio(ratio, 1.618) || isSacredRatio(ratio, 0.618)) {
      goldenRatioDetected = `Seg ${i + 1}/${i + 2} = ${ratio.toFixed(3)}`;
    }
    if (isSacredRatio(ratio, 1.414) || isSacredRatio(ratio, 0.707)) {
      sqrt2Detected = `Seg ${i + 1}/${i + 2} = ${ratio.toFixed(3)}`;
    }
    if (isSacredRatio(ratio, 1.732) || isSacredRatio(ratio, 0.577)) {
      sqrt3Detected = `Seg ${i + 1}/${i + 2} = ${ratio.toFixed(3)}`;
    }
  }

  const complexity =
    pathPoints.length > 0
      ? `${Math.min(Math.round((pathPoints.length / 9) * 10), 10)}/10`
      : "0/10";
  const symmetry =
    pathPoints.length < 3
      ? "Minimal"
      : pathPoints.length > 6
        ? "Complex Asymmetry"
        : "Balanced Flow";

  return {
    circle: {
      radius: `${circleRadius}px`,
      circumference: `${circumference}px`,
      area: `${area}px²`,
      spacing: "40°",
    },
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
      sqrt3: sqrt3Detected,
    },
    energetic: {
      complexity,
      symmetry,
      intersections: "0",
    },
  };
};

const updateMeasurementsDisplay = (measurements) => {
  document.getElementById("circleRadius").textContent =
    measurements.circle.radius;
  document.getElementById("circleCircumference").textContent =
    measurements.circle.circumference;
  document.getElementById("circleArea").textContent = measurements.circle.area;
  document.getElementById("numberSpacing").textContent =
    measurements.circle.spacing;
  document.getElementById("pathLength").textContent =
    measurements.path.totalLength;
  document.getElementById("segmentCount").textContent =
    measurements.path.segmentCount;
  document.getElementById("avgSegment").textContent =
    measurements.path.avgSegment;
  document.getElementById("startAngle").textContent =
    measurements.path.startAngle;
  document.getElementById("endAngle").textContent = measurements.path.endAngle;
  document.getElementById("goldenRatio").textContent =
    measurements.ratios.golden;
  document.getElementById("sqrt2Ratio").textContent = measurements.ratios.sqrt2;
  document.getElementById("sqrt3Ratio").textContent = measurements.ratios.sqrt3;
  document.getElementById("complexity").textContent =
    measurements.energetic.complexity;
  document.getElementById("symmetry").textContent =
    measurements.energetic.symmetry;
  document.getElementById("intersectionCount").textContent =
    measurements.energetic.intersections;
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

const drawStaticBackground = (
  ctx,
  centerX,
  centerY,
  radius,
  numberPositions,
  method,
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (0.92 + i * 0.03), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(${method === "vowels" ? "255, 107, 107" : "108, 92, 231"}, ${0.15 - i * 0.04})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle =
    method === "vowels"
      ? "rgba(255, 107, 107, 0.6)"
      : "rgba(108, 92, 231, 0.6)";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.94, 0, 2 * Math.PI);
  ctx.strokeStyle =
    method === "vowels"
      ? "rgba(255, 107, 107, 0.45)"
      : "rgba(108, 92, 231, 0.45)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let num = 1; num <= 9; num++) {
    const pos = numberPositions[num];

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 0.08, 0, 2 * Math.PI);
    ctx.fillStyle =
      method === "vowels"
        ? "rgba(255, 107, 107, 0.18)"
        : "rgba(108, 92, 231, 0.18)";
    ctx.fill();
    ctx.strokeStyle =
      method === "vowels"
        ? "rgba(255, 107, 107, 0.8)"
        : "rgba(108, 92, 231, 0.8)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle =
      method === "vowels"
        ? "rgba(255, 107, 107, 0.2)"
        : "rgba(108, 92, 231, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `bold ${Math.max(30, radius / 8.5)}px Arial`;
    ctx.fillStyle = "#e6e1ff";
    ctx.shadowColor =
      method === "vowels"
        ? "rgba(255, 107, 107, 0.9)"
        : "rgba(108, 92, 231, 0.9)";
    ctx.shadowBlur = 18;
    ctx.fillText(num.toString(), pos.x, pos.y);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#1a1825";
    ctx.lineWidth = 3.5;
    ctx.strokeText(num.toString(), pos.x, pos.y);
    ctx.strokeStyle = method === "vowels" ? "#ff5252" : "#6c5ce7";
    ctx.lineWidth = 2;
    ctx.strokeText(num.toString(), pos.x, pos.y);

    ctx.font = `normal ${Math.max(14, radius / 22)}px Arial`;
    ctx.fillStyle = "rgba(255, 209, 102, 0.9)";
    ctx.fillText(
      `${((num - 1) * 40) % 360}°`,
      centerX + radius * 0.78 * Math.cos((pos.angle * Math.PI) / 180),
      centerY + radius * 0.78 * Math.sin((pos.angle * Math.PI) / 180),
    );
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.12, 0, 2 * Math.PI);
  ctx.fillStyle =
    method === "vowels"
      ? "rgba(255, 107, 107, 0.12)"
      : "rgba(108, 92, 231, 0.12)";
  ctx.fill();
  ctx.strokeStyle =
    method === "vowels"
      ? "rgba(255, 107, 107, 0.65)"
      : "rgba(108, 92, 231, 0.65)";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  const seedRadius = radius * 0.06;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * 2 * Math.PI;
    const x = centerX + seedRadius * Math.cos(angle);
    const y = centerY + seedRadius * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, seedRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.35)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * (0.4 + Math.random() * 0.58);
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    const size = Math.random() * 3.5 + 1.2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.25})`;
    ctx.fill();
  }

  if (method === "all") {
    ctx.beginPath();
    let spiralAngle = 0;
    let spiralRadius = radius * 0.15;
    const spiralCenterX = centerX + radius * 0.25;
    const spiralCenterY = centerY - radius * 0.25;
    while (spiralRadius < radius * 0.6) {
      const x = spiralCenterX + spiralRadius * Math.cos(spiralAngle);
      const y = spiralCenterY + spiralRadius * Math.sin(spiralAngle);
      if (spiralAngle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      spiralAngle += 0.1;
      spiralRadius *= 1.035;
    }
    ctx.strokeStyle = "rgba(255, 209, 102, 0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
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
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const xPos = x + Math.cos(angle) * radius;
    const yPos = y + Math.sin(angle) * radius;
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
    method = "all",
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

  document.getElementById("canvasOverlay").classList.add("active");
  document.getElementById("animationStatus").classList.add("active");
  document.getElementById("animateBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;

  const animate = () => {
    if (!isAnimating) {
      cancelAnimationFrame(animationId);
      return;
    }

    drawStaticBackground(
      ctx,
      centerX,
      centerY,
      radius,
      numberPositions,
      method,
    );

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
      ctx.fillStyle = method === "vowels" ? "#ff5252" : "#ff6b6b";
      ctx.fill();
      ctx.strokeStyle = method === "vowels" ? "#cc0000" : "#ff5252";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowColor =
        method === "vowels"
          ? "rgba(255, 82, 82, 0.95)"
          : "rgba(255, 107, 107, 0.95)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = method === "vowels" ? "#ff8c42" : "#6c5ce7";
    for (let i = 0; i <= currentSegment; i++) {
      const point = pathPoints[i];
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = method === "vowels" ? "#e65c00" : "#5a4fcf";
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
      ctx.fillStyle = method === "vowels" ? "#ff5252" : "#ff6b6b";
      ctx.fill();
      ctx.strokeStyle = method === "vowels" ? "#cc0000" : "#ff5252";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowColor =
        method === "vowels"
          ? "rgba(255, 82, 82, 0.95)"
          : "rgba(255, 107, 107, 0.95)";
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

        ctx.fillStyle = method === "vowels" ? "#ff8c42" : "#6c5ce7";
        for (let i = 0; i < pathPoints.length; i++) {
          const point = pathPoints[i];
          ctx.beginPath();
          ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = method === "vowels" ? "#e65c00" : "#5a4fcf";
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
        ctx.fillStyle = method === "vowels" ? "#ff5252" : "#ff6b6b";
        ctx.fill();
        ctx.strokeStyle = method === "vowels" ? "#cc0000" : "#ff5252";
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

        document.getElementById("canvasOverlay").classList.remove("active");
        document.getElementById("animationStatus").classList.remove("active");
        document.getElementById("animateBtn").disabled = false;
        document.getElementById("resetBtn").disabled = false;
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
      document.getElementById("canvasOverlay").classList.remove("active");
      document.getElementById("animationStatus").classList.remove("active");
      document.getElementById("animateBtn").disabled = false;
      document.getElementById("resetBtn").disabled = false;
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
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  setTimeout(() => notification.classList.remove("show"), 4200);
};

const showError = (message) => {
  const errorElement = document.getElementById("inputError");
  errorElement.textContent = message;
  errorElement.classList.add("show");
  setTimeout(() => errorElement.classList.remove("show"), 6200);
};

const hideError = () => {
  document.getElementById("inputError").classList.remove("show");
};

const setLoading = (isLoading, method = "all") => {
  const button = document.getElementById("generate");
  const buttonText = document.getElementById("buttonText");
  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
    buttonText.innerHTML = '<span class="spinner"></span>Sacred Calculation...';
  } else {
    button.classList.remove("loading");
    button.disabled = false;
    buttonText.textContent = "Generate Sacred Sigil";
    if (document.body.classList.contains("vowel-mode")) {
      button.style.background =
        "linear-gradient(135deg, var(--vowel-only-primary) 0%, var(--vowel-only-secondary) 100%)";
    } else {
      button.style.background =
        "linear-gradient(135deg, var(--all-letters-primary) 0%, var(--all-letters-secondary) 100%)";
    }
  }
};

const updateCharCount = (text, method = "all") => {
  const charCountEl = document.getElementById("charCount");
  const alphaCountEl = document.getElementById("alphaCount");
  const vowelCountEl = document.getElementById("vowelCount");
  const totalChars = text.length;
  const alphaChars = text.replace(/[^a-zA-Z]/g, "").length;
  charCountEl.textContent = `${totalChars}/10000 characters`;
  charCountEl.className = "char-count";
  if (totalChars > 8000) charCountEl.classList.add("warning");
  else if (totalChars > 5000) charCountEl.classList.add("good");
  alphaCountEl.textContent = `${alphaChars} alphabetic letters`;
  if (method === "vowels") {
    const vowels = text.toUpperCase().replace(/[^AEIOUY]/g, "");
    vowelCountEl.textContent = `${vowels.length} vowels (with Y)`;
    vowelCountEl.style.display = "block";
    alphaCountEl.style.display = "none";
  } else {
    vowelCountEl.style.display = "none";
    alphaCountEl.style.display = "block";
  }
};

const setupDownloadButton = () => {
  document.getElementById("downloadBtn").addEventListener("click", () => {
    try {
      const canvas = document.getElementById("sigilCanvas");
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

const updateMethodDisplay = (method) => {
  const allLettersOption = document.getElementById("allLettersOption");
  const vowelOnlyOption = document.getElementById("vowelOnlyOption");
  const switchSlider = document.querySelector(".switch-slider");
  const allLettersDesc = document.querySelector(
    ".method-desc-item.all-letters",
  );
  const vowelOnlyDesc = document.querySelector(".method-desc-item.vowel-only");
  if (method === "vowels") {
    document.body.classList.add("vowel-mode");
    document.body.classList.remove("all-letters-mode");
    allLettersOption.classList.remove("active");
    vowelOnlyOption.classList.add("active");
    switchSlider.style.left = "calc(50% + 5px)";
    switchSlider.style.background =
      "linear-gradient(135deg, var(--vowel-only-primary), var(--vowel-only-secondary))";
    allLettersDesc.classList.remove("active");
    vowelOnlyDesc.classList.add("active");
    document.getElementById("vowelCount").style.display = "block";
    document.getElementById("stage1Title").textContent =
      "✧ Stage 1: Unique Vowels (with Y) ✧";
    document.getElementById("stage1Title").classList.add("vowel-mode");
    document.getElementById("stage2Title").classList.add("vowel-mode");
    document.getElementById("stage3Title").classList.add("vowel-mode");
    document.querySelector(".all-letters-method").style.display = "none";
    document.querySelector(".vowel-only-method").style.display = "block";
    document.getElementById("processedLabel").textContent = "Vowels Processed";
  } else {
    document.body.classList.remove("vowel-mode");
    document.body.classList.add("all-letters-mode");
    allLettersOption.classList.add("active");
    vowelOnlyOption.classList.remove("active");
    switchSlider.style.left = "5px";
    switchSlider.style.background =
      "linear-gradient(135deg, var(--all-letters-primary), var(--all-letters-secondary))";
    allLettersDesc.classList.add("active");
    vowelOnlyDesc.classList.remove("active");
    document.getElementById("vowelCount").style.display = "none";
    document.getElementById("stage1Title").textContent =
      "✧ Stage 1: Unique Elements ✧";
    document.getElementById("stage1Title").classList.remove("vowel-mode");
    document.getElementById("stage2Title").classList.remove("vowel-mode");
    document.getElementById("stage3Title").classList.remove("vowel-mode");
    document.querySelector(".all-letters-method").style.display = "block";
    document.querySelector(".vowel-only-method").style.display = "none";
    document.getElementById("processedLabel").textContent = "Processed";
  }
  const button = document.getElementById("generate");
  button.style.background =
    method === "vowels"
      ? "linear-gradient(135deg, var(--vowel-only-primary) 0%, var(--vowel-only-secondary) 100%)"
      : "linear-gradient(135deg, var(--all-letters-primary) 0%, var(--all-letters-secondary) 100%)";
};

// ========== MAIN PROCESSING ==========
let currentAnimation = null;
let currentPathPoints = [];
let currentDigits = [];
let currentNumberPositions = null;
let currentCanvasData = null;
let currentMeasurements = null;
let currentMethod = "all";

const generateSigilSequence = (text, options = {}) => {
  const { showSteps = false, method = "all" } = options;
  const steps = [];
  try {
    if (method === "vowels") {
      // VOWEL-ONLY METHOD (with Y)
      const vowelsOnly = extractVowels(text);
      if (showSteps) {
        steps.push({
          step: "Stage 1a: Extract Vowels Only",
          detail: `Removed all consonants. Kept only vowels (A, E, I, O, U, Y).
${vowelsOnly.length} vowels remain.
Example: "THE MONEY" → "EOE"`,
          type: "success",
          method: "vowels",
        });
      }
      const vowelDedupResult = keepFirstOccurrenceOnly(vowelsOnly.split(""));
      const {
        unique: uniqueVowels,
        uniqueCount: vowelUniqueCount,
        duplicateCount: vowelDuplicateCount,
      } = vowelDedupResult;
      if (showSteps) {
        const vowelSample = vowelsOnly.slice(0, 25);
        const uniqueVowelSample = uniqueVowels.slice(0, 25).join("");
        steps.push({
          step: "Stage 1b: Remove Duplicate Vowels",
          detail: `Keep only FIRST occurrence of each vowel.
All subsequent duplicates eliminated.
Vowels: "${vowelSample}${vowelsOnly.length > 25 ? "..." : ""}"
After deduplication: "${uniqueVowelSample}"
${vowelUniqueCount} unique vowels remain (${vowelDuplicateCount} removed)`,
          type: "success",
          method: "vowels",
        });
      }
      // Vowel to position mapping
      const vowelPositionsMap = { A: 1, E: 5, I: 9, O: 15, U: 21, Y: 25 };
      const positions = uniqueVowels.map((v) => vowelPositionsMap[v]);
      const posSample = positions.slice(0, 15).join(", ");
      if (showSteps) {
        steps.push({
          step: "Stage 2a: Convert Vowels to Positions",
          detail: `Convert each unique vowel to its alphabet position.
Vowels: [${uniqueVowels.slice(0, 15).join(", ")}${uniqueVowels.length > 15 ? "..." : ""}]
Positions: [${positions
            .slice(0, 15)
            .map((p, i) => `${uniqueVowels[i]}=${p}`)
            .join(", ")}]`,
          type: "success",
          method: "vowels",
        });
      }
      const digitsAfterRoot = positionsToDigits(positions);
      if (showSteps) {
        const digSample = digitsAfterRoot.slice(0, 15).join(", ");
        steps.push({
          step: "Stage 2b: Digital Root Reduction",
          detail: `Convert each position to single digit (1-9).
Positions: [${posSample}]
Digits:     [${digSample}]`,
          type: "success",
          method: "vowels",
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
          detail: `Keep only FIRST occurrence of each digit (1-9).
All subsequent duplicates eliminated.
Digits: [${digSample}]
After deduplication: [${uniqueDigSample}]
${digUniqueCount} unique digits remain (${digDuplicateCount} removed)`,
          type: "success",
          method: "vowels",
        });
      }
      const { sum, masterNumber } = calculateMasterSigil(uniqueDigits);
      if (showSteps) {
        const digitsStr = uniqueDigits.join(" + ");
        steps.push({
          step: "Stage 3a: Sum Final Unique Digits",
          detail: `Add all remaining unique digits together:
${digitsStr} = ${sum}`,
          type: "success",
          method: "vowels",
        });
        steps.push({
          step: "Stage 3b: Master Sigil (Final Reduction)",
          detail: `Reduce sum to single digit:
${sum} → ${masterNumber}`,
          type: "success",
          method: "vowels",
        });
      }
      return {
        success: true,
        masterSigil: masterNumber,
        uniqueElements: uniqueVowels,
        uniqueDigits: uniqueDigits,
        sum: sum,
        steps: steps,
        stats: {
          inputLetters: text.replace(/[^a-zA-Z]/g, "").length,
          processedCount: vowelsOnly.length,
          uniqueCount: vowelUniqueCount,
          finalDigits: digUniqueCount,
          method: "vowels",
        },
      };
    } else {
      // ALL-LETTERS METHOD
      const cleanedText = text.replace(/[^a-zA-Z]/g, "").toUpperCase();
      const positions = textToPositions(text);
      if (showSteps) {
        steps.push({
          step: "Stage 1a: Clean & Convert to Positions",
          detail: `Removed non-alphabetic characters. ${cleanedText.length} letters remain.
Example: "THE" → T=20, H=8, E=5`,
          type: "success",
          method: "all",
        });
      }
      const positionDedupResult = keepFirstOccurrenceOnly(positions);
      const {
        unique: uniquePositions,
        uniqueCount: posUniqueCount,
        duplicateCount: posDuplicateCount,
      } = positionDedupResult;
      if (showSteps) {
        const posSample = formatArray(positions, 20);
        const uniquePosSample = formatArray(uniquePositions, 20);
        steps.push({
          step: "Stage 1b: Remove Duplicate Positions",
          detail: `Keep only FIRST occurrence of each position number.
All subsequent duplicates eliminated.
Positions: [${posSample}]
After deduplication: [${uniquePosSample}]
${posUniqueCount} unique positions remain (${posDuplicateCount} removed)`,
          type: "success",
          method: "all",
        });
      }
      const digitsAfterRoot = positionsToDigits(uniquePositions);
      if (showSteps) {
        const posSample = formatArray(uniquePositions, 15);
        const digSample = formatArray(digitsAfterRoot, 15);
        steps.push({
          step: "Stage 2a: Digital Root Reduction",
          detail: `Convert each unique position to single digit (1-9).
Positions: [${posSample}]
Digits:     [${digSample}]`,
          type: "success",
          method: "all",
        });
      }
      const digitDedupResult = keepFirstOccurrenceOnly(digitsAfterRoot);
      const {
        unique: uniqueDigits,
        uniqueCount: digUniqueCount,
        duplicateCount: digDuplicateCount,
      } = digitDedupResult;
      if (showSteps) {
        const digSample = formatArray(digitsAfterRoot, 20);
        const uniqueDigSample = formatArray(uniqueDigits, 20);
        steps.push({
          step: "Stage 2b: Remove Duplicate Digits",
          detail: `Keep only FIRST occurrence of each digit (1-9).
All subsequent duplicates eliminated.
Digits: [${digSample}]
After deduplication: [${uniqueDigSample}]
${digUniqueCount} unique digits remain (${digDuplicateCount} removed)`,
          type: "success",
          method: "all",
        });
      }
      const { sum, masterNumber } = calculateMasterSigil(uniqueDigits);
      if (showSteps) {
        const digitsStr = uniqueDigits.join(" + ");
        steps.push({
          step: "Stage 3a: Sum Final Unique Digits",
          detail: `Add all remaining unique digits together:
${digitsStr} = ${sum}`,
          type: "success",
          method: "all",
        });
        steps.push({
          step: "Stage 3b: Master Sigil (Final Reduction)",
          detail: `Reduce sum to single digit:
${sum} → ${masterNumber}`,
          type: "success",
          method: "all",
        });
      }
      return {
        success: true,
        masterSigil: masterNumber,
        uniqueElements: uniquePositions,
        uniqueDigits: uniqueDigits,
        sum: sum,
        steps: steps,
        stats: {
          inputLetters: cleanedText.length,
          processedCount: cleanedText.length,
          uniqueCount: posUniqueCount,
          finalDigits: digUniqueCount,
          method: "all",
        },
      };
    }
  } catch (error) {
    console.error("Sigil generation error:", error);
    steps.push({
      step: "Error",
      detail: `Type: ${error.name}
Message: ${error.message}
Please check your input and try again.`,
      type: "error",
      method: method,
    });
    return {
      success: false,
      error: error,
      steps: steps,
      stats: { method: method },
    };
  }
};

const drawSigilStatic = (
  digits,
  canvasId,
  showIntersections = true,
  method = "all",
) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.38;
  const numberPositions = calculateCirclePositions(centerX, centerY, radius);
  drawStaticBackground(ctx, centerX, centerY, radius, numberPositions, method);
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
    ctx.fillStyle = method === "vowels" ? "#ff8c42" : "#6c5ce7";
    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(10, radius / 28), 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = method === "vowels" ? "#e65c00" : "#5a4fcf";
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
    ctx.fillStyle = method === "vowels" ? "#ff5252" : "#ff6b6b";
    ctx.fill();
    ctx.strokeStyle = method === "vowels" ? "#cc0000" : "#ff5252";
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

const displayResults = (result) => {
  if (currentAnimation) {
    currentAnimation.stop();
    currentAnimation = null;
  }
  document.getElementById("positionsSequence").textContent = "-";
  document.getElementById("positionsSequence").classList.remove("error");
  document.getElementById("digitsSequence").textContent = "-";
  document.getElementById("digitsSequence").classList.remove("error");
  document.getElementById("result").textContent = "-";
  document.getElementById("result").classList.remove("error");
  document.getElementById("sumDisplay").textContent = "-";
  document.getElementById("stepsContainer").innerHTML = "";
  document.getElementById("sequenceContainer").innerHTML = "";
  document.getElementById("intersectionList").innerHTML =
    "<li>Generate sigil to see sacred intersections</li>";
  if (!result.success) {
    document.getElementById("result").textContent = "ERROR";
    document.getElementById("result").classList.add("error");
    showNotification(result.error.message || "An error occurred", "error");
    const stepElement = document.createElement("div");
    stepElement.className = `step error${result.stats.method === "vowels" ? " vowel-mode" : ""}`;
    stepElement.innerHTML = `
      <span class="step-number">Error:</span>
      <div class="step-detail">${result.steps[0].detail.replace(/\n/g, "<br>")}</div>
    `;
    document.getElementById("stepsContainer").appendChild(stepElement);
    const canvas = document.getElementById("sigilCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("circleRadius").textContent = "-";
    document.getElementById("circleCircumference").textContent = "-";
    document.getElementById("circleArea").textContent = "-";
    document.getElementById("pathLength").textContent = "-";
    document.getElementById("segmentCount").textContent = "-";
    document.getElementById("goldenRatio").textContent = "None";
    return;
  }
  const { masterSigil, uniqueElements, uniqueDigits, sum, steps, stats } =
    result;
  document.getElementById("positionsSequence").textContent =
    stats.method === "vowels"
      ? uniqueElements.join("")
      : formatArray(uniqueElements, 20);
  document.getElementById("digitsSequence").textContent =
    uniqueDigits.join(" → ");
  document.getElementById("result").textContent = masterSigil;
  document.getElementById("sumDisplay").textContent = `${sum} → ${masterSigil}`;
  document.getElementById("letterCount").textContent = stats.inputLetters;
  document.getElementById("processedCount").textContent = stats.processedCount;
  document.getElementById("uniqueCount").textContent = stats.uniqueCount;
  document.getElementById("finalDigits").textContent = stats.finalDigits;
  createSequenceLabels(uniqueDigits);
  const stepsContainer = document.getElementById("stepsContainer");
  steps.forEach((step) => {
    const stepElement = document.createElement("div");
    stepElement.className = `step${step.type === "error" ? " error" : step.type === "success" ? " success" : ""}${step.method === "vowels" ? " vowel-mode" : ""}`;
    stepElement.innerHTML = `
      <span class="step-number">${step.step}:</span>
      <div class="step-detail">${step.detail.replace(/\n/g, "<br>")}</div>
    `;
    stepsContainer.appendChild(stepElement);
  });
  const showIntersections =
    document.getElementById("showIntersections").checked;
  const canvasResult = drawSigilStatic(
    uniqueDigits,
    "sigilCanvas",
    showIntersections,
    stats.method,
  );
  if (canvasResult && showIntersections) {
    updateIntersectionDisplay(
      canvasResult.intersections,
      canvasResult.pathPoints,
      uniqueDigits,
    );
  } else {
    document.getElementById("intersectionList").innerHTML =
      "<li>Intersection display disabled</li>";
  }
  const methodLabel =
    stats.method === "vowels" ? "Vowel-Only Sigil" : "All-Letters Sigil";
  showNotification(
    `Sacred ${methodLabel} ${masterSigil} generated with geometric precision!`,
    "success",
  );
};

// ========== EVENT HANDLERS ==========
document.addEventListener("DOMContentLoaded", () => {
  // Declare variables at TOP of scope to avoid temporal dead zone
  let isProcessing = false;
  let lastProcessedText = "";

  // Method switching
  document.getElementById("allLettersOption").addEventListener("click", () => {
    updateMethodDisplay("all");
    currentMethod = "all";
    lastProcessedText = "";
    if (
      document.getElementById("autoProcess").checked &&
      document.getElementById("affirmation").value.trim()
    ) {
      processSigil();
    }
  });

  document.getElementById("vowelOnlyOption").addEventListener("click", () => {
    updateMethodDisplay("vowels");
    currentMethod = "vowels";
    lastProcessedText = "";
    if (
      document.getElementById("autoProcess").checked &&
      document.getElementById("affirmation").value.trim()
    ) {
      processSigil();
    }
  });

  setupDownloadButton();
  updateMethodDisplay("all");

  const canvas = document.getElementById("sigilCanvas");
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    const container = canvas.parentElement;
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

  document.getElementById("animateBtn").addEventListener("click", () => {
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
        showIntersections: document.getElementById("showIntersections").checked,
        onAnimationComplete: (intersections) => {
          if (document.getElementById("showIntersections").checked) {
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
        method: currentMethod,
      },
    );
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (currentAnimation) {
      currentAnimation.stop();
      currentAnimation = null;
    }
    document
      .querySelectorAll("#sequenceContainer .sequence-label")
      .forEach((label, index) => {
        label.classList.toggle("active", index === 0);
      });
    if (currentCanvasData) {
      ctx.putImageData(currentCanvasData, 0, 0);
    }
    document.getElementById("canvasOverlay").classList.remove("active");
    document.getElementById("animationStatus").classList.remove("active");
    document.getElementById("animateBtn").disabled = false;
    document.getElementById("resetBtn").disabled = false;
    showNotification("Sacred animation reset", "success");
  });

  const affirmationInput = document.getElementById("affirmation");
  const showStepsCheckbox = document.getElementById("showSteps");
  const showIntersectionsCheckbox =
    document.getElementById("showIntersections");
  const autoProcessCheckbox = document.getElementById("autoProcess");

  const validateAndProcess = () => {
    hideError();
    const text = affirmationInput.value.trim();
    updateCharCount(text, currentMethod);
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
    if (currentMethod === "vowels") {
      const vowels = text.toUpperCase().replace(/[^AEIOUY]/g, "");
      if (vowels.length === 0) {
        showError(
          "No vowels found (vowels are A, E, I, O, U, Y). Add vowels to your text.",
        );
        return false;
      }
    }
    if (text === lastProcessedText) return false;
    return true;
  };

  const processSigil = () => {
    if (isProcessing) return;
    if (!validateAndProcess()) return;
    isProcessing = true;
    setLoading(true, currentMethod);
    const text = affirmationInput.value.trim();
    const options = {
      showSteps: showStepsCheckbox.checked,
      method: currentMethod,
    };
    try {
      const result = generateSigilSequence(text, options);
      displayResults(result);
      lastProcessedText = text;
    } catch (error) {
      console.error("Processing error:", error);
      showError("An unexpected error occurred. Please try again.");
      showNotification("Sacred calculation failed", "error");
    } finally {
      setLoading(false, currentMethod);
      isProcessing = false;
    }
  };

  document.getElementById("generate").addEventListener("click", processSigil);

  affirmationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) processSigil();
  });

  let inputTimeout;
  affirmationInput.addEventListener("input", () => {
    updateCharCount(affirmationInput.value, currentMethod);
    if (autoProcessCheckbox.checked && !isProcessing) {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        if (validateAndProcess()) processSigil();
      }, 1400);
    }
  });

  autoProcessCheckbox.addEventListener("change", () => {
    if (autoProcessCheckbox.checked && affirmationInput.value.trim())
      processSigil();
  });

  showIntersectionsCheckbox.addEventListener("change", () => {
    if (lastProcessedText && !isProcessing) processSigil();
  });

  updateCharCount(affirmationInput.value, currentMethod);
  setTimeout(processSigil, 500);
});
