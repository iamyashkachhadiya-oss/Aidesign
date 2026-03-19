import { MachineConfig, DesignVariation, ValidationResult } from "./types";
import { buildGenerationPrompt } from "./prompt-builder";
import { validateDesign, deriveMockSpec } from "./constraint-engine";

// ─── Mock Fabric Pattern Images ───────────────────────────────────────────────

function generatePatternSVG(
  variationIndex: number,
  colors: string[],
  config: MachineConfig,
  prompt: string
): string {
  const c1 = colors[0] || "#C0392B";
  const c2 = colors[1] || "#F5A623";
  const c3 = colors[2] || "#E8D5B7";
  const c4 = colors[3] || "#2C3E50";

  // Use a hash of prompt + time to pick pattern variation
  const seed = (prompt.length + Date.now()) % 6;

  const patterns = [
    // Pattern 0: Geometric diagonal
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="${c4}"/>
          <rect width="20" height="20" fill="${c1}" opacity="0.8"/>
          <rect x="20" y="20" width="20" height="20" fill="${c1}" opacity="0.8"/>
          <line x1="0" y1="40" x2="40" y2="0" stroke="${c3}" stroke-width="2" opacity="0.4"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="0.7" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p0)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p0)" opacity="0.5"/>
    </svg>`,

    // Pattern 1: Diamonds
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p1" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="${c4}"/>
          <polygon points="30,5 55,30 30,55 5,30" fill="${c1}" opacity="0.9"/>
          <polygon points="30,15 45,30 30,45 15,30" fill="${c2}" opacity="0.7"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="0.8" numOctaves="4"/><feDisplacementMap in="SourceGraphic" scale="1.5"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p1)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p1)" opacity="0.4"/>
    </svg>`,

    // Pattern 2: Floral Circle
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p2" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="${c4}"/>
          <circle cx="40" cy="40" r="20" fill="${c1}" opacity="0.8"/>
          <circle cx="40" cy="40" r="10" fill="${c2}" opacity="0.9"/>
          <circle cx="40" cy="40" r="4" fill="${c3}"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="0.6" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p2)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p2)" opacity="0.5"/>
    </svg>`,

    // Pattern 3: Stripes
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p3" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="${c4}"/>
          <rect width="25" height="50" fill="${c1}" opacity="0.3"/>
          <line x1="12" y1="0" x2="12" y2="50" stroke="${c2}" stroke-width="4" opacity="0.5"/>
          <line x1="37" y1="0" x2="37" y2="50" stroke="${c3}" stroke-width="2" opacity="0.4"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="2"/><feDisplacementMap in="SourceGraphic" scale="1"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p3)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p3)" opacity="0.6"/>
    </svg>`,

    // Pattern 4: Grid
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p4" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="${c4}"/>
          <rect x="2" y="2" width="26" height="26" fill="${c1}" opacity="0.1"/>
          <line x1="0" y1="0" x2="30" y2="0" stroke="${c2}" stroke-width="1" opacity="0.3"/>
          <line x1="0" y1="0" x2="0" y2="30" stroke="${c2}" stroke-width="1" opacity="0.3"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="1.2" numOctaves="2"/><feDisplacementMap in="SourceGraphic" scale="1"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p4)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p4)" opacity="0.7"/>
    </svg>`,

    // Pattern 5: Waves
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <defs>
        <pattern id="p5" width="100" height="40" patternUnits="userSpaceOnUse">
          <rect width="100" height="40" fill="${c4}"/>
          <path d="M0,20 Q25,0 50,20 T100,20" stroke="${c1}" stroke-width="10" fill="none" opacity="0.4"/>
          <path d="M0,30 Q25,10 50,30 T100,30" stroke="${c2}" stroke-width="5" fill="none" opacity="0.3"/>
        </pattern>
        <filter id="n"><feTurbulence baseFrequency="0.5" numOctaves="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#p5)" filter="url(#n)"/>
      <rect width="400" height="400" fill="url(#p5)" opacity="0.5"/>
    </svg>`,
  ];

  const selectedPatternIdx = (variationIndex + seed) % patterns.length;
  return `data:image/svg+xml;base64,${Buffer.from(patterns[selectedPatternIdx]).toString("base64")}`;
}

// ─── Mock Colors ─────────────────────────────────────────────────────────────

function getMockColors(config: MachineConfig, variationIndex: number, prompt: string): string[] {
  const allPalettes = [
    ["#8B1A1A", "#C0392B", "#F5A623", "#E8D5B7"], // Red/Gold
    ["#1A237E", "#3949AB", "#90CAF9", "#E8EAF6"], // Blue
    ["#1B5E20", "#2E7D32", "#F9A825", "#FFF9C4"], // Green/Gold
    ["#4A148C", "#7B1FA2", "#F5A623", "#FCE4EC"], // Purple
    ["#3E2723", "#795548", "#FF8F00", "#FFF8E1"], // Earthy
  ];

  const lowerPrompt = prompt.toLowerCase();
  let baseIndex = (variationIndex + config.dobbyShafts) % allPalettes.length;

  // Simple keyword matching
  if (lowerPrompt.includes("red")) baseIndex = 0;
  else if (lowerPrompt.includes("blue")) baseIndex = 1;
  else if (lowerPrompt.includes("green")) baseIndex = 2;
  else if (lowerPrompt.includes("purple")) baseIndex = 3;
  else if (lowerPrompt.includes("brown") || lowerPrompt.includes("ikat")) baseIndex = 4;

  const palette = allPalettes[baseIndex];
  
  // Add some slight randomization to the hex codes
  return palette.slice(0, config.weftChannels).map(hex => {
    if (Math.random() > 0.7) return hex; // Keep base color often
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const shift = () => Math.floor(Math.random() * 20) - 10;
    const clamp = (v: number) => Math.floor(Math.max(0, Math.min(255, v)));
    return "#" + [clamp(r + shift()), clamp(g + shift()), clamp(b + shift())]
      .map(v => v.toString(16).padStart(2, "0")).join("");
  });
}

// ─── Main Mock Generation Function ───────────────────────────────────────────

export async function generateMockVariations(
  config: MachineConfig,
  userPrompt: string
): Promise<DesignVariation[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [0, 1, 2].map((i) => {
    // Inject randomness into the generation process
    const colors = getMockColors(config, i, userPrompt);
    const enrichedPrompt = buildGenerationPrompt(userPrompt, config, i as 0 | 1 | 2);
    const spec = deriveMockSpec(config);
    spec.colors = colors;
    const validation = validateDesign(spec, config);

    return {
      id: `var-${i}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      index: i,
      imageUrl: generatePatternSVG(i, colors, config, userPrompt),
      prompt: enrichedPrompt,
      validation,
      colors,
    };
  });
}

// ─── Mock Edit Function ───────────────────────────────────────────────────────

export async function generateMockEdit(
  originalImageUrl: string,
  instruction: string,
  config: MachineConfig,
  colors: string[]
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const varIndex = Math.floor(Math.random() * 6);
  return generatePatternSVG(varIndex, colors, config, instruction);
}
