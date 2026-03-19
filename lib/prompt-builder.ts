import { MachineConfig } from "./types";

const VARIATION_STYLES = [
  "primary variation with balanced composition",
  "denser repeat pattern variation",
  "bold geometric interpretation variation",
];

const WEAVE_STRUCTURES: Record<number, string> = {
  8: "8-shaft twill or satin weave",
  12: "12-shaft networked twill",
  16: "16-shaft complex dobby structure",
  20: "20-shaft figured weave with fine detail",
};

export function buildGenerationPrompt(
  userDescription: string,
  config: MachineConfig,
  variationIndex: 0 | 1 | 2
): string {
  const weaveStructure = WEAVE_STRUCTURES[config.dobbyShafts] || "dobby weave";
  const variationStyle = VARIATION_STYLES[variationIndex];
  const yarnDesc = config.yarnCountUnit === "Ne"
    ? `${config.yarnCount} Ne count ${config.yarnType.toLowerCase()}`
    : `${config.yarnCount} Denier ${config.yarnType.toLowerCase()}`;

  return [
    userDescription.trim(),
    `woven on a Toyota Rapier dobby loom`,
    `${config.dobbyShafts}-shaft ${weaveStructure}`,
    `${config.weftChannels}-color weft with ${config.weftChannels} feeder channels`,
    `${config.fabricWeightGSM} GSM fabric weight`,
    `${yarnDesc} yarn`,
    `reed width ${config.reedWidth}cm`,
    `${variationStyle}`,
    `realistic woven fabric texture simulation`,
    `tight interlacement structure visible`,
    `photorealistic textile surface`,
    `studio lighting, macro photography style`,
    `traditional Indian textile aesthetic`,
  ].join(", ");
}

export function buildEditPrompt(
  baseDescription: string,
  instruction: string,
  config: MachineConfig,
  colors: string[]
): string {
  const colorList = colors.join(", ");
  return [
    baseDescription,
    instruction.trim(),
    `weft color palette: ${colorList}`,
    `${config.dobbyShafts}-shaft ${config.weftChannels}-color woven on Toyota Rapier dobby loom`,
    `${config.fabricWeightGSM} GSM ${config.yarnType.toLowerCase()}`,
    `realistic fabric texture simulation`,
    `preserve weave structure integrity`,
  ].join(", ");
}

export function buildImageAnalysisPrompt(config: MachineConfig): string {
  return `You are a textile design expert analyzing a fabric design reference image for a ${config.yarnType} dobby loom weaving project.

Analyze the uploaded image and describe:
1. The dominant design motifs and pattern type (geometric, floral, abstract, etc.)
2. Color palette (list 2-${config.weftChannels} main colors as descriptive names)
3. Pattern repeat characteristics (dense, open, complex)
4. Cultural influences or design style
5. How this could be woven on a ${config.dobbyShafts}-shaft rapier dobby loom at ${config.fabricWeightGSM} GSM

Respond in 2-3 sentences as a single cohesive design description suitable for an image generation prompt.
Focus on visual characteristics only, not technical weave specifics.`;
}
