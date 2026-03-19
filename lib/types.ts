// ─── Machine Configuration ───────────────────────────────────────────────────

export type ReedWidth =
  | 140 | 150 | 170 | 190 | 210 | 230 | 250 | 260 | 280 | 300 | 340 | 360 | 390;

export type DobbySHafts = 8 | 12 | 16 | 20;
export type WeftChannels = 2 | 4 | 6 | 8;
export type YarnType =
  | "Cotton" | "Wool" | "Silk" | "Polyester" | "Nylon" | "Blended" | "Specialty/Fancy";
export type YarnCountUnit = "Ne" | "Denier";

export interface MachineConfig {
  reedWidth: ReedWidth;
  dobbyShafts: DobbySHafts;
  weftChannels: WeftChannels;
  speedMin: number;  // PPM, 400–700
  speedMax: number;
  yarnType: YarnType;
  yarnCount: number;
  yarnCountUnit: YarnCountUnit;
  fabricWeightGSM: number;  // 15–800
}

export const DEFAULT_MACHINE_CONFIG: MachineConfig = {
  reedWidth: 150,
  dobbyShafts: 16,
  weftChannels: 4,
  speedMin: 400,
  speedMax: 600,
  yarnType: "Cotton",
  yarnCount: 40,
  yarnCountUnit: "Ne",
  fabricWeightGSM: 120,
};

// ─── Design Input ────────────────────────────────────────────────────────────

export type DesignInputType = "text" | "image";

export interface DesignInput {
  type: DesignInputType;
  textPrompt?: string;
  imageFile?: File;
  imageBase64?: string;
  imagePreviewUrl?: string;
}

// ─── Constraint Validation ───────────────────────────────────────────────────

export type ConstraintSeverity = "error" | "warning" | "info";

export interface ConstraintIssue {
  id: string;
  severity: ConstraintSeverity;
  rule: string;
  message: string;
  autoFixed: boolean;
  fixDescription?: string;
}

export interface ValidationResult {
  passed: boolean;
  issues: ConstraintIssue[];
  shaftUsed: number;
  colorsUsed: number;
  recommendedSpeed: number;
  patternRepeatSize: { width: number; height: number };
  estimatedPPI: number;
}

// ─── Generated Design ────────────────────────────────────────────────────────

export interface DesignVariation {
  id: string;
  index: number;
  imageUrl: string;
  prompt: string;
  validation: ValidationResult;
  colors: string[];  // hex colors used
  isSelected?: boolean;
}

// ─── Edit Instruction ────────────────────────────────────────────────────────

export interface EditInstruction {
  id: string;
  instruction: string;
  timestamp: number;
  resultImageUrl?: string;
}

// ─── Studio State ────────────────────────────────────────────────────────────

export type StudioStep = 1 | 2 | 3 | 4 | 5;

export interface StudioState {
  step: StudioStep;
  machineConfig: MachineConfig;
  designInput: DesignInput;
  variations: DesignVariation[];
  selectedVariationId: string | null;
  editedImageUrl: string | null;
  editColors: string[];
  isGenerating: boolean;
  isEditing: boolean;
  generationProgress: number;  // 0–100
  error: string | null;
  editHistory: EditInstruction[];
}

// ─── Export ──────────────────────────────────────────────────────────────────

export interface SpecSummary {
  patternRepeatWidth: number;  // cm
  patternRepeatHeight: number; // cm
  estimatedPPI: number;
  shaftCount: number;
  recommendedSpeed: number;    // PPM
  colorCount: number;
  yarnType: string;
  fabricWeightGSM: number;
}
