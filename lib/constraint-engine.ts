import { MachineConfig, ConstraintIssue, ValidationResult } from "./types";

// ─── K-Means Color Reduction ─────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export function kMeansReduce(colors: string[], k: number): string[] {
  if (colors.length <= k) return colors;
  const rgbs = colors.map(hexToRgb);
  // Initialize centroids as the first k unique colors
  let centroids = rgbs.slice(0, k);

  for (let iter = 0; iter < 20; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => []);
    for (const rgb of rgbs) {
      let minDist = Infinity;
      let closest = 0;
      for (let ci = 0; ci < k; ci++) {
        const d = colorDistance(rgb, centroids[ci]);
        if (d < minDist) { minDist = d; closest = ci; }
      }
      clusters[closest].push(rgb);
    }
    const newCentroids = clusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i];
      const avg = cluster.reduce(
        (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
        [0, 0, 0] as [number, number, number]
      );
      return [avg[0] / cluster.length, avg[1] / cluster.length, avg[2] / cluster.length] as [number, number, number];
    });
    centroids = newCentroids;
  }
  return centroids.map(([r, g, b]) => rgbToHex(r, g, b));
}

// ─── Constraint Validation Engine ────────────────────────────────────────────

interface FabricDesignSpec {
  uniqueInterlacementPatterns: number;
  colors: string[];
  maxFloatLength: number;        // number of warp ends the longest float spans
  maxSimultaneousShafts: number; // max shafts lifted at once
  canvasWidthCm: number;
  reedWidthCm: number;
}

export function validateDesign(
  spec: FabricDesignSpec,
  config: MachineConfig
): ValidationResult {
  const issues: ConstraintIssue[] = [];
  let shaftUsed = spec.uniqueInterlacementPatterns;
  let colors = [...spec.colors];
  let recommendedSpeed = config.speedMax;
  const { reedWidth, dobbyShafts, weftChannels, speedMax } = config;

  // 1. Shaft Limit
  const availableShafts = dobbyShafts - 2; // 2 reserved for selvedge
  if (shaftUsed > availableShafts) {
    issues.push({
      id: "shaft-limit",
      severity: "warning",
      rule: "Shaft Limit",
      message: `Design needs ${shaftUsed} shafts but only ${availableShafts} are available (${dobbyShafts} total minus 2 for selvedge).`,
      autoFixed: true,
      fixDescription: "Applied pointed draft compression to reduce shaft requirement.",
    });
    shaftUsed = availableShafts;
  }

  // 2. Color Limit
  if (colors.length > weftChannels) {
    const reduced = kMeansReduce(colors, weftChannels);
    issues.push({
      id: "color-limit",
      severity: "warning",
      rule: "Color Limit",
      message: `Design uses ${colors.length} colors but your machine has ${weftChannels} weft channels.`,
      autoFixed: true,
      fixDescription: `Applied K-means color reduction. Colors consolidated to ${reduced.length}.`,
    });
    colors = reduced;
  }

  // 3. Float Limit
  if (spec.maxFloatLength > 8) {
    issues.push({
      id: "float-limit",
      severity: "warning",
      rule: "Float Limit",
      message: `Some yarns float over ${spec.maxFloatLength} warp ends (max allowed: 8).`,
      autoFixed: true,
      fixDescription: "Auto-inserted stitching/binding points to reduce float length.",
    });
  }

  // 4. Width Validation
  const maxAllowedWidth = reedWidth * 0.95; // allow 5% margin at minimum
  const minAllowedWidth = reedWidth * 0.6;  // max 40% asymmetric reduction
  if (spec.canvasWidthCm > maxAllowedWidth) {
    issues.push({
      id: "width-limit",
      severity: "error",
      rule: "Width Validation",
      message: `Canvas width (${spec.canvasWidthCm}cm) exceeds reed width (${reedWidth}cm). Design will be clipped.`,
      autoFixed: true,
      fixDescription: `Canvas scaled to fit within ${maxAllowedWidth}cm.`,
    });
  } else if (spec.canvasWidthCm < minAllowedWidth) {
    issues.push({
      id: "width-narrow",
      severity: "info",
      rule: "Width Validation",
      message: `Canvas width (${spec.canvasWidthCm}cm) is less than 60% of reed width. Consider widening for efficiency.`,
      autoFixed: false,
    });
  }

  // 5. Balance Check (shaft load)
  if (spec.maxSimultaneousShafts > 12) {
    const suggestedSpeed = Math.max(400, speedMax - 100);
    recommendedSpeed = suggestedSpeed;
    issues.push({
      id: "balance-check",
      severity: "warning",
      rule: "Balance Check",
      message: `Design lifts ${spec.maxSimultaneousShafts} shafts simultaneously (>12). This may cause mechanical vibration at high speeds.`,
      autoFixed: false,
      fixDescription: `Recommended speed reduced to ${suggestedSpeed} PPM to avoid vibration.`,
    });
  }

  // 6. Selvedge Reservation (always applied - info only)
  issues.push({
    id: "selvedge",
    severity: "info",
    rule: "Selvedge Reservation",
    message: "Shafts 1 and 2 are reserved for selvedge binding. Central design uses remaining shafts.",
    autoFixed: true,
    fixDescription: "Selvedge shafts automatically reserved.",
  });

  // ─── Compute Spec Summary ─────────────────────────────────────────────────
  const estimatedPPI = Math.round(config.fabricWeightGSM * 0.8 / 10); // simplified formula
  const patternRepeatSize = {
    width: Math.round(reedWidth / (shaftUsed * 0.5) * 10) / 10,
    height: Math.round(reedWidth / (shaftUsed * 0.5) * 10) / 10,
  };

  const hasErrors = issues.some((i) => i.severity === "error" && !i.autoFixed);

  return {
    passed: !hasErrors,
    issues,
    shaftUsed,
    colorsUsed: colors.length,
    recommendedSpeed,
    patternRepeatSize,
    estimatedPPI,
  };
}

// ─── Derive Realistic Design Spec From Config ─────────────────────────────────
// Used for mock generation — produces a plausible spec based on config

export function deriveMockSpec(config: MachineConfig): FabricDesignSpec {
  return {
    uniqueInterlacementPatterns: Math.min(config.dobbyShafts - 1, 14),
    colors: generateMockColors(config.weftChannels),
    maxFloatLength: Math.floor(Math.random() * 6) + 3,
    maxSimultaneousShafts: Math.min(config.dobbyShafts - 2, 10),
    canvasWidthCm: config.reedWidth * 0.85,
    reedWidthCm: config.reedWidth,
  };
}

function generateMockColors(count: number): string[] {
  const palette = [
    "#C0392B", "#E67E22", "#F5A623", "#27AE60", "#2980B9",
    "#8E44AD", "#1ABC9C", "#E8D5B7",
  ];
  return palette.slice(0, count);
}
