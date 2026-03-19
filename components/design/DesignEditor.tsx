'use client';

import { useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Wand2 } from "lucide-react";
import { DesignVariation, MachineConfig } from "@/lib/types";

interface DesignEditorProps {
  variation: DesignVariation;
  editedImageUrl: string | null;
  config: MachineConfig;
  onEdit: (instruction: string, colors: string[]) => Promise<void>;
  isEditing: boolean;
  onColorsChange: (colors: string[]) => void;
  colors: string[];
}

const PRESET_PALETTES = [
  { name: "Red & Gold", colors: ["#8B1A1A", "#C0392B", "#F5A623", "#E8D5B7"] },
  { name: "Royal Blue", colors: ["#1A237E", "#3949AB", "#90CAF9", "#FFFFFF"] },
  { name: "Forest", colors: ["#1B5E20", "#2E7D32", "#F9A825", "#FFF9C4"] },
  { name: "Purple Silk", colors: ["#4A148C", "#7B1FA2", "#F5A623", "#FCE4EC"] },
  { name: "Earthy Ikat", colors: ["#3E2723", "#795548", "#FF8F00", "#FFF8E1"] },
  { name: "Black & Gold", colors: ["#000000", "#212121", "#F5A623", "#FFFDE7"] },
];

export default function DesignEditor({
  variation,
  editedImageUrl,
  config,
  onEdit,
  isEditing,
  onColorsChange,
  colors,
}: DesignEditorProps) {
  const [instruction, setInstruction] = useState("");
  const [zoom, setZoom] = useState(1);

  const currentImageUrl = editedImageUrl || variation.imageUrl;
  const maxColors = config.weftChannels;

  const handleColorChange = (index: number, hex: string) => {
    const updated = [...colors];
    updated[index] = hex;
    onColorsChange(updated);
  };

  const applyPalette = (palette: string[]) => {
    onColorsChange(palette.slice(0, maxColors));
  };

  const handleEdit = async () => {
    if (!instruction.trim()) return;
    await onEdit(instruction, colors);
    setInstruction("");
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Edit & Refine Selected Design
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-secondary)" }}
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs w-12 text-center" style={{ color: "var(--text-muted)" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-secondary)" }}
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Design Preview */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          height: 280,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-card)",
        }}
      >
        <div
          className="w-full h-full overflow-hidden flex items-center justify-center"
          style={{ cursor: zoom > 1 ? "grab" : "default" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImageUrl}
            alt="Selected design"
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              objectFit: "cover",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
        {isEditing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(15,14,23,0.85)" }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "var(--primary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Applying your edits…
            </p>
          </div>
        )}
      </div>

      {/* Color Palette */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
          Weft Color Palette ({maxColors} channels)
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: maxColors }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <input
                type="color"
                value={colors[i] || "#888888"}
                onChange={(e) => handleColorChange(i, e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                style={{ background: colors[i] || "#888", borderRadius: 8 }}
                title={`Color channel ${i + 1}`}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>C{i + 1}</span>
            </div>
          ))}
        </div>
        {/* Preset palettes */}
        <div className="mt-3">
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Quick palettes:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PALETTES.map((palette) => (
              <button
                key={palette.name}
                type="button"
                onClick={() => applyPalette(palette.colors)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                <div className="flex gap-0.5">
                  {palette.colors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                  ))}
                </div>
                {palette.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text Edit Instruction */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
          Edit Instructions
        </p>
        <div className="flex gap-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder='e.g. "make the pattern smaller" or "change background to blue"'
            rows={2}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm resize-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEdit();
            }}
          />
          <button
            type="button"
            onClick={handleEdit}
            disabled={isEditing || !instruction.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all self-end"
            style={{
              background: instruction.trim() ? "var(--primary)" : "rgba(255,255,255,0.06)",
              color: instruction.trim() ? "#000" : "var(--text-muted)",
              cursor: instruction.trim() ? "pointer" : "not-allowed",
            }}
          >
            <Wand2 size={14} />
            Apply
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          Tip: Press ⌘Enter to apply edits quickly
        </p>
      </div>
    </div>
  );
}
