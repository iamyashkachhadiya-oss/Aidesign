'use client';

import { MachineConfig, DEFAULT_MACHINE_CONFIG, ReedWidth, DobbySHafts, WeftChannels, YarnType } from "@/lib/types";

const REED_WIDTHS: ReedWidth[] = [140, 150, 170, 190, 210, 230, 250, 260, 280, 300, 340, 360, 390];
const YARN_TYPES: YarnType[] = ["Cotton", "Wool", "Silk", "Polyester", "Nylon", "Blended", "Specialty/Fancy"];

interface MachineSetupFormProps {
  config: MachineConfig;
  onChange: (config: MachineConfig) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
      {children}
    </p>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{children}</label>
      {hint && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</span>}
    </div>
  );
}

function ChipGroup<T extends number | string>({
  options, value, onChange, label, valueLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label?: (v: T) => string;
  valueLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{
            background: value === opt ? "var(--primary)" : "rgba(255,255,255,0.06)",
            color: value === opt ? "#000" : "var(--text-secondary)",
            border: value === opt ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
          }}
        >
          {label ? label(opt) : String(opt)}{valueLabel ? " " + valueLabel : ""}
        </button>
      ))}
    </div>
  );
}

export default function MachineSetupForm({ config, onChange }: MachineSetupFormProps) {
  const set = <K extends keyof MachineConfig>(key: K, value: MachineConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="space-y-6">
      {/* Reed Width */}
      <div>
        <SectionLabel>Loom Configuration</SectionLabel>
        <FieldLabel hint="nominal">Reed Width</FieldLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {REED_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => set("reedWidth", w)}
              className="py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: config.reedWidth === w ? "var(--primary)" : "rgba(255,255,255,0.06)",
                color: config.reedWidth === w ? "#000" : "var(--text-secondary)",
                border: config.reedWidth === w ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
              }}
            >
              {w}cm
            </button>
          ))}
        </div>
      </div>

      {/* Dobby Shafts */}
      <div>
        <FieldLabel hint="available shafts">Dobby Shafts</FieldLabel>
        <ChipGroup
          options={[8, 12, 16, 20] as DobbySHafts[]}
          value={config.dobbyShafts}
          onChange={(v) => set("dobbyShafts", v)}
          label={(v) => `${v} Shafts`}
        />
      </div>

      {/* Weft Color Channels */}
      <div>
        <FieldLabel hint="feeder channels">Weft Colors</FieldLabel>
        <ChipGroup
          options={[2, 4, 6, 8] as WeftChannels[]}
          value={config.weftChannels}
          onChange={(v) => set("weftChannels", v)}
          label={(v) => `${v} Colors`}
        />
      </div>

      {/* Speed Slider */}
      <div>
        <FieldLabel hint={`${config.speedMin}–${config.speedMax} PPM`}>Operating Speed</FieldLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>Min</span>
            <input
              type="range"
              min={400}
              max={700}
              step={50}
              value={config.speedMin}
              onChange={(e) => set("speedMin", Math.min(Number(e.target.value), config.speedMax - 50))}
              className="flex-1"
            />
            <span className="text-xs w-14" style={{ color: "var(--text-secondary)" }}>{config.speedMin} PPM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>Max</span>
            <input
              type="range"
              min={400}
              max={700}
              step={50}
              value={config.speedMax}
              onChange={(e) => set("speedMax", Math.max(Number(e.target.value), config.speedMin + 50))}
              className="flex-1"
            />
            <span className="text-xs w-14" style={{ color: "var(--text-secondary)" }}>{config.speedMax} PPM</span>
          </div>
        </div>
      </div>

      {/* Yarn */}
      <div>
        <SectionLabel>Yarn & Material</SectionLabel>
        <FieldLabel>Yarn Type</FieldLabel>
        <select
          value={config.yarnType}
          onChange={(e) => set("yarnType", e.target.value as YarnType)}
          className="w-full px-3 py-2.5 rounded-xl text-sm appearance-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        >
          {YARN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Yarn Count */}
      <div>
        <FieldLabel>Yarn Count</FieldLabel>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={9999}
            value={config.yarnCount}
            onChange={(e) => set("yarnCount", Number(e.target.value))}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          />
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
            {(["Ne", "Denier"] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => set("yarnCountUnit", unit)}
                className="px-3 py-2 text-sm font-medium transition-all"
                style={{
                  background: config.yarnCountUnit === unit ? "var(--primary)" : "rgba(255,255,255,0.04)",
                  color: config.yarnCountUnit === unit ? "#000" : "var(--text-secondary)",
                }}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {config.yarnCountUnit === "Ne" ? "Ne = English count (spun yarns like Cotton, Wool)" : "Denier = filament yarn count (Silk, Polyester, Nylon)"}
        </p>
      </div>

      {/* Fabric Weight GSM */}
      <div>
        <FieldLabel hint={`${config.fabricWeightGSM} GSM`}>Fabric Weight (GSM)</FieldLabel>
        <input
          type="range"
          min={15}
          max={800}
          step={5}
          value={config.fabricWeightGSM}
          onChange={(e) => set("fabricWeightGSM", Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>15 GSM (sheer)</span>
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{config.fabricWeightGSM} GSM</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>800 GSM (heavy)</span>
        </div>
      </div>
    </div>
  );
}
