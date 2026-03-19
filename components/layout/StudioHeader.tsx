'use client';

import { Sparkles, ChevronRight, Settings2, Wand2, Download, Edit3 } from "lucide-react";

interface StudioHeaderProps {
  currentStep: number;
}

const STEPS = [
  { n: 1, label: "Machine Setup", icon: Settings2 },
  { n: 2, label: "Design Idea", icon: Wand2 },
  { n: 3, label: "AI Designs", icon: Sparkles },
  { n: 4, label: "Edit & Refine", icon: Edit3 },
  { n: 5, label: "Export", icon: Download },
];

export default function StudioHeader({ currentStep }: StudioHeaderProps) {
  return (
    <header
      className="flex flex-col gap-4 px-4 py-4 md:px-6"
      style={{
        background: "rgba(26, 24, 48, 0.95)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles size={18} color="#000" />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text leading-none">LoomAI</h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
              Toyota Rapier Dobby Studio
            </p>
          </div>
        </div>

        {/* Right badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(76, 175, 125, 0.12)",
            border: "1px solid rgba(76, 175, 125, 0.3)",
            color: "var(--success)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
          Constraint Engine Active
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = currentStep === step.n;
          const isDone = currentStep > step.n;

          return (
            <div key={step.n} className="flex items-center gap-1 flex-shrink-0">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive ? "var(--primary)" : isDone ? "rgba(76, 175, 125, 0.12)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "#000" : isDone ? "var(--success)" : "var(--text-muted)",
                  border: isActive ? "none" : isDone ? "1px solid rgba(76, 175, 125, 0.2)" : "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={11} />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.n}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </header>
  );
}
