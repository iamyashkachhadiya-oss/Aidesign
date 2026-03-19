'use client';

import { Cpu, Zap, Palette, Ruler } from "lucide-react";
import { MachineConfig } from "@/lib/types";

interface MachineProfileCardProps {
  config: MachineConfig;
}

export default function MachineProfileCard({ config }: MachineProfileCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(245,166,35,0.02) 100%)",
        border: "1px solid rgba(245,166,35,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--primary-glow)" }}
        >
          <Cpu size={14} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>Toyota Rapier Loom</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dobby Shedding Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Ruler size={11} style={{ color: "var(--primary)" }} />
          <span>{config.reedWidth}cm reed</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Cpu size={11} style={{ color: "var(--primary)" }} />
          <span>{config.dobbyShafts} shafts</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Palette size={11} style={{ color: "var(--primary)" }} />
          <span>{config.weftChannels} weft colors</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Zap size={11} style={{ color: "var(--primary)" }} />
          <span>{config.speedMin}–{config.speedMax} PPM</span>
        </div>
      </div>

      <div
        className="mt-3 pt-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(245,166,35,0.15)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {config.yarnCount} {config.yarnCountUnit} {config.yarnType}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--primary-glow)", color: "var(--primary)" }}
        >
          {config.fabricWeightGSM} GSM
        </span>
      </div>
    </div>
  );
}
