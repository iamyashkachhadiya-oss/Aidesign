'use client';

import { useState, useCallback, useEffect } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Settings2 } from "lucide-react";
import StudioHeader from "@/components/layout/StudioHeader";
import MachineSetupForm from "@/components/machine/MachineSetupForm";
import MachineProfileCard from "@/components/machine/MachineProfileCard";
import DesignInputPanel from "@/components/design/DesignInputPanel";
import DesignVariations from "@/components/design/DesignVariations";
import DesignEditor from "@/components/design/DesignEditor";
import ExportCard from "@/components/design/ExportCard";
import {
  MachineConfig,
  DEFAULT_MACHINE_CONFIG,
  DesignInput,
  DesignVariation,
  StudioStep,
} from "@/lib/types";

type ActivePanel = "setup" | "input" | "results" | "edit" | "export";

const STORAGE_KEY_CONFIG = "loomai_machine_config";
const STORAGE_KEY_DESIGNS = "loomai_design_history";

export default function StudioPage() {
  const [config, setConfig] = useState<MachineConfig>(DEFAULT_MACHINE_CONFIG);
  const [designInput, setDesignInput] = useState<DesignInput>({ type: "text", textPrompt: "" });
  const [variations, setVariations] = useState<DesignVariation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [editColors, setEditColors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StudioStep>(1);
  const [mobilePanel, setMobilePanel] = useState<ActivePanel>("setup");
  const [setupExpanded, setSetupExpanded] = useState(true);

  // ─── Persistence ──────────────────────────────────────────────────────────

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) { console.warn("Failed to load saved config", e); }
    }
    const savedDesigns = localStorage.getItem(STORAGE_KEY_DESIGNS);
    if (savedDesigns) {
      try { setVariations(JSON.parse(savedDesigns)); } catch (e) { console.warn("Failed to load saved designs", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (variations.length > 0) {
      localStorage.setItem(STORAGE_KEY_DESIGNS, JSON.stringify(variations.slice(0, 10)));
    }
  }, [variations]);

  const selectedVariation = variations.find((v) => v.id === selectedId) ?? null;

  // ─── Generate Designs ─────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    const prompt = designInput.textPrompt?.trim() || "";
    const hasImage = !!designInput.imageBase64;

    if (!prompt && !hasImage) {
      setError("Please describe your design idea or upload a reference image.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationProgress(10);
    setVariations([]);
    setSelectedId(null);
    setEditedImageUrl(null);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setGenerationProgress((p) => Math.min(p + 8, 85));
    }, 400);

    try {
      const body = {
        config,
        prompt: prompt || "abstract textile design",
        imageBase64: designInput.imageBase64,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      clearInterval(progressTimer);
      setGenerationProgress(95);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setVariations(data.variations);
      setGenerationProgress(100);
      setCurrentStep(3);
      setMobilePanel("results");
    } catch (err) {
      clearInterval(progressTimer);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 800);
    }
  }, [config, designInput]);

  // ─── Select Variation ─────────────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setEditedImageUrl(null);
    const variation = variations.find((v) => v.id === id);
    if (variation) {
      setEditColors(variation.colors);
      setCurrentStep(4);
      setMobilePanel("edit");
    }
  }, [variations]);

  // ─── Edit Design ──────────────────────────────────────────────────────────

  const handleEdit = useCallback(async (instruction: string, colors: string[]) => {
    if (!selectedVariation) return;
    setIsEditing(true);
    setError(null);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          originalImageUrl: editedImageUrl || selectedVariation.imageUrl,
          instruction,
          colors,
        }),
      });
      if (!res.ok) throw new Error("Edit failed");
      const data = await res.json();
      setEditedImageUrl(data.updatedImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed. Please try again.");
    } finally {
      setIsEditing(false);
    }
  }, [config, editedImageUrl, selectedVariation]);

  // ─── Step Navigation ──────────────────────────────────────────────────────

  const canProceedToExport = selectedVariation !== null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <StudioHeader currentStep={currentStep} />

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-start gap-3 animate-slide-up"
          style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
        >
          <AlertCircle size={16} style={{ color: "var(--error)", marginTop: 1 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--error)" }}>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs mt-0.5"
              style={{ color: "rgba(239,68,68,0.7)" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: Machine Setup + Design Input ── */}
        <div
          className="flex flex-col border-r overflow-y-auto"
          style={{
            width: "100%",
            maxWidth: "100%",
            borderColor: "var(--border-subtle)",
            // Desktop: fixed left panel
          }}
        >
          {/* Desktop Split View */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            {/* Left Column */}
            <div
              className="flex flex-col overflow-y-auto"
              style={{ width: 380, minWidth: 380, borderRight: "1px solid var(--border-subtle)" }}
            >
              {/* Machine Setup */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                    style={{ background: currentStep >= 1 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: currentStep >= 1 ? "#000" : "var(--text-muted)" }}
                  >1</div>
                  <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Machine Setup</h2>
                </div>
                <MachineSetupForm config={config} onChange={setConfig} />
              </div>

              {/* Design Input */}
              <div className="p-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                    style={{ background: currentStep >= 2 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: currentStep >= 2 ? "#000" : "var(--text-muted)" }}
                  >2</div>
                  <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Your Design Idea</h2>
                </div>
                <DesignInputPanel input={designInput} onChange={setDesignInput} />

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="mt-5 w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200"
                  style={{
                    background: isGenerating ? "rgba(245,166,35,0.4)" : "var(--primary)",
                    color: isGenerating ? "rgba(0,0,0,0.5)" : "#000",
                    cursor: isGenerating ? "wait" : "pointer",
                    boxShadow: !isGenerating ? "0 8px 24px rgba(245,166,35,0.25)" : "none",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: "#000" }} />
                      Generating {Math.round(generationProgress)}%…
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate 3 Fabric Designs
                    </>
                  )}
                </button>

                {/* Progress bar */}
                {isGenerating && (
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%`, background: "var(--primary)" }}
                    />
                  </div>
                )}

                <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
                  AI enriches your prompt with your machine specs automatically
                </p>
              </div>

              {/* Machine Profile Card (sticky bottom) */}
              <div className="p-5" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(15,14,23,0.5)" }}>
                <MachineProfileCard config={config} />
              </div>
            </div>

            {/* Right Column — Results */}
            <div className="flex-1 overflow-y-auto">
              {/* Empty state */}
              {variations.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
                    style={{ background: "var(--primary-glow)", border: "1px solid rgba(245,166,35,0.2)" }}
                  >
                    <Sparkles size={40} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="text-center max-w-xs">
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                      Ready to Weave Magic
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      Set up your loom, describe your design idea, and click Generate. Our AI will create 3 fabric design variations in seconds — all checked against your machine's physical limits.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                    {["Shaft-aware", "Color-locked", "Float-safe"].map((badge) => (
                      <div
                        key={badge}
                        className="text-center py-2 px-3 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(245,166,35,0.08)", color: "var(--primary)", border: "1px solid rgba(245,166,35,0.15)" }}
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generating state */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full border-4 border-transparent animate-spin"
                      style={{ borderTopColor: "var(--primary)" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={24} style={{ color: "var(--primary)" }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      Creating Your Fabric Designs
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Generating 3 variations · Checking machine constraints…
                    </p>
                    <div
                      className="mt-4 h-2 w-64 rounded-full overflow-hidden mx-auto"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%`, background: "var(--primary)" }}
                      />
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      {generationProgress}%
                    </p>
                  </div>
                </div>
              )}

              {/* Results */}
              {variations.length > 0 && (
                <div className="p-5 space-y-6">
                  {/* Step 3: Variations */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                        style={{ background: "var(--primary)", color: "#000" }}>3</div>
                      <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        Your AI-Generated Designs
                      </h2>
                    </div>
                    <DesignVariations
                      variations={variations}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                    />
                  </div>

                  {/* Step 4: Editor */}
                  {selectedVariation && (
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24 }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                          style={{ background: "var(--primary)", color: "#000" }}>4</div>
                        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          Edit & Refine
                        </h2>
                      </div>
                      <DesignEditor
                        variation={selectedVariation}
                        editedImageUrl={editedImageUrl}
                        config={config}
                        onEdit={handleEdit}
                        isEditing={isEditing}
                        onColorsChange={setEditColors}
                        colors={editColors.length > 0 ? editColors : selectedVariation.colors}
                      />
                    </div>
                  )}

                  {/* Step 5: Export */}
                  {canProceedToExport && selectedVariation && (
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24 }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                          style={{ background: "var(--primary)", color: "#000" }}>5</div>
                        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          Export Design
                        </h2>
                      </div>
                      <ExportCard
                        variation={selectedVariation}
                        editedImageUrl={editedImageUrl}
                        config={config}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── MOBILE VIEW ── */}
          <div className="lg:hidden flex flex-col flex-1">
            {/* Mobile nav tabs */}
            <div
              className="flex border-b overflow-x-auto"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              {[
                { id: "setup" as ActivePanel, label: "Machine", step: 1 },
                { id: "input" as ActivePanel, label: "Design", step: 2 },
                { id: "results" as ActivePanel, label: "Results", step: 3 },
                { id: "edit" as ActivePanel, label: "Edit", step: 4 },
                { id: "export" as ActivePanel, label: "Export", step: 5 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobilePanel(tab.id)}
                  disabled={tab.step > currentStep && variations.length === 0}
                  className="flex-1 py-3 text-xs font-medium flex-shrink-0 transition-all"
                  style={{
                    color: mobilePanel === tab.id ? "var(--primary)" : "var(--text-muted)",
                    borderBottom: mobilePanel === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
                    opacity: tab.step > currentStep && variations.length === 0 ? 0.4 : 1,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile panel content */}
            <div className="flex-1 overflow-y-auto p-4">
              {mobilePanel === "setup" && (
                <div>
                  <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    Machine Setup
                  </h2>
                  <MachineSetupForm config={config} onChange={setConfig} />
                  <div className="mt-5">
                    <MachineProfileCard config={config} />
                  </div>
                </div>
              )}

              {mobilePanel === "input" && (
                <div>
                  <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    Your Design Idea
                  </h2>
                  <DesignInputPanel input={designInput} onChange={setDesignInput} />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="mt-5 w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5"
                    style={{
                      background: isGenerating ? "rgba(245,166,35,0.4)" : "var(--primary)",
                      color: "#000",
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                          style={{ borderTopColor: "#000" }} />
                        Generating {Math.round(generationProgress)}%…
                      </>
                    ) : (
                      <><Sparkles size={18} /> Generate 3 Designs</>
                    )}
                  </button>
                  {isGenerating && (
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%`, background: "var(--primary)" }} />
                    </div>
                  )}
                </div>
              )}

              {mobilePanel === "results" && (
                <div>
                  {variations.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        No designs yet. Go to the Design tab to generate.
                      </p>
                    </div>
                  ) : (
                    <DesignVariations
                      variations={variations}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                    />
                  )}
                </div>
              )}

              {mobilePanel === "edit" && selectedVariation && (
                <DesignEditor
                  variation={selectedVariation}
                  editedImageUrl={editedImageUrl}
                  config={config}
                  onEdit={handleEdit}
                  isEditing={isEditing}
                  onColorsChange={setEditColors}
                  colors={editColors.length > 0 ? editColors : selectedVariation.colors}
                />
              )}

              {mobilePanel === "export" && selectedVariation && (
                <ExportCard
                  variation={selectedVariation}
                  editedImageUrl={editedImageUrl}
                  config={config}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
