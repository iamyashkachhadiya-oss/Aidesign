'use client';

import { CheckCircle, AlertTriangle, XCircle, Info, ZoomIn } from "lucide-react";
import { DesignVariation, ConstraintIssue } from "@/lib/types";

interface DesignVariationsProps {
  variations: DesignVariation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function ConstraintBadge({ issues }: { issues: ConstraintIssue[] }) {
  const errors = issues.filter((i) => i.severity === "error" && !i.autoFixed);
  const warnings = issues.filter((i) => i.severity === "warning");
  const autoFixed = issues.filter((i) => i.autoFixed && i.severity !== "info");

  if (errors.length > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
        style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--error)" }}>
        <XCircle size={12} />
        {errors.length} constraint error{errors.length > 1 ? "s" : ""}
      </div>
    );
  }
  if (warnings.length > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
        style={{ background: "rgba(255, 181, 71, 0.15)", color: "var(--warning)" }}>
        <AlertTriangle size={12} />
        {autoFixed.length > 0 ? `${autoFixed.length} auto-fixed` : `${warnings.length} warning${warnings.length > 1 ? "s" : ""}`}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
      style={{ background: "rgba(76, 175, 125, 0.15)", color: "var(--success)" }}>
      <CheckCircle size={12} />
      All constraints passed
    </div>
  );
}

function ConstraintDetails({ issues }: { issues: ConstraintIssue[] }) {
  const visible = issues.filter((i) => i.severity !== "info" || i.autoFixed);
  if (visible.length === 0) return null;
  return (
    <div className="space-y-1.5 mt-3 text-xs">
      {visible.map((issue) => (
        <div key={issue.id} className="flex items-start gap-2"
          style={{ color: issue.severity === "error" ? "var(--error)" : issue.severity === "warning" ? "var(--warning)" : "var(--text-muted)" }}>
          {issue.severity === "error" ? <XCircle size={11} className="mt-0.5 flex-shrink-0" /> :
            issue.severity === "warning" ? <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" /> :
              <Info size={11} className="mt-0.5 flex-shrink-0" />}
          <span>
            <span className="font-semibold">{issue.rule}: </span>
            {issue.autoFixed ? issue.fixDescription : issue.message}
          </span>
        </div>
      ))}
    </div>
  );
}

const VARIATION_LABELS = ["Design A", "Design B", "Design C"];
const VARIATION_SUBTITLES = ["Balanced Composition", "Dense Repeat", "Bold Interpretation"];

export default function DesignVariations({ variations, selectedId, onSelect }: DesignVariationsProps) {
  if (variations.length === 0) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          3 Design Variations Generated
        </h3>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Machine constraints applied automatically
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {variations.map((v, i) => {
          const isSelected = v.id === selectedId;
          return (
            <div
              key={v.id}
              className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer relative"
              style={{
                border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border-subtle)",
                background: "var(--bg-card)",
                boxShadow: isSelected ? "0 0 24px var(--primary-glow)" : "none",
                transform: isSelected ? "translateY(-2px)" : "none",
              }}
              onClick={() => onSelect(v.id)}
            >
              {/* Image */}
              <div className="relative" style={{ height: 180 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.imageUrl}
                  alt={VARIATION_LABELS[i]}
                  className="w-full h-full object-cover"
                />
                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(245, 166, 35, 0.12)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--primary)" }}>
                      <CheckCircle size={18} color="#000" />
                    </div>
                  </div>
                )}
                {/* Variation label */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                  style={{ background: "rgba(0,0,0,0.7)", color: "var(--primary)" }}>
                  {VARIATION_LABELS[i]}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {VARIATION_LABELS[i]}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {VARIATION_SUBTITLES[i]}
                    </p>
                  </div>
                  <ConstraintBadge issues={v.validation.issues} />
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-1 pt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {[
                    { label: "Shafts", value: v.validation.shaftUsed },
                    { label: "Colors", value: v.validation.colorsUsed },
                    { label: "PPI", value: v.validation.estimatedPPI },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <ConstraintDetails issues={v.validation.issues} />

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect(v.id); }}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    background: isSelected ? "var(--primary)" : "rgba(245, 166, 35, 0.1)",
                    color: isSelected ? "#000" : "var(--primary)",
                    border: "1px solid " + (isSelected ? "var(--primary)" : "rgba(245, 166, 35, 0.3)"),
                  }}
                >
                  {isSelected ? "Selected ✓" : "Select This Design"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
