'use client';

import { Upload, FileImage, X } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { DesignInput } from "@/lib/types";
import { fileToBase64 } from "@/lib/utils";

interface DesignInputPanelProps {
  input: DesignInput;
  onChange: (input: DesignInput) => void;
}

const EXAMPLE_PROMPTS = [
  "Geometric floral in red and gold, traditional Indian style",
  "Banarasi brocade with peacock motifs, royal blue and silver",
  "Ikat zigzag pattern in earthy terracotta and cream",
  "Madhubani-inspired floral border, black outline on ivory",
  "Diamond twill weave in forest green and saffron",
];

export default function DesignInputPanel({ input, onChange }: DesignInputPanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image">(input.type);
  const [isDragOver, setIsDragOver] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (tab: "text" | "image") => {
    setActiveTab(tab);
    onChange({ ...input, type: tab });
  };

  const handleTextChange = (text: string) => {
    onChange({ ...input, type: "text", textPrompt: text });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const base64 = await fileToBase64(file);
    const previewUrl = URL.createObjectURL(file);
    onChange({ type: "image", imageFile: file, imageBase64: base64, imagePreviewUrl: previewUrl });
  }, [onChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  }, [handleFile]);

  const clearImage = () => {
    onChange({ type: "image", imageFile: undefined, imageBase64: undefined, imagePreviewUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const useExample = (prompt: string) => {
    setActiveTab("text");
    onChange({ ...input, type: "text", textPrompt: prompt });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
        {(["text", "image"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: activeTab === tab ? "var(--primary)" : "transparent",
              color: activeTab === tab ? "#000" : "var(--text-secondary)",
            }}
          >
            {tab === "text" ? "Describe Design" : "Upload Image"}
          </button>
        ))}
      </div>

      {/* Text Prompt */}
      {activeTab === "text" ? (
        <div className="space-y-3">
          <textarea
            value={input.textPrompt || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Describe your fabric design idea in plain words..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          />
          {/* Example prompts */}
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => useExample(p)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: "rgba(245, 166, 35, 0.08)",
                    border: "1px solid rgba(245, 166, 35, 0.2)",
                    color: "var(--primary)",
                  }}
                >
                  {p.length > 40 ? p.slice(0, 37) + "…" : p}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Upload */
        <div className="space-y-3">
          {input.imagePreviewUrl ? (
            <div className="relative rounded-xl overflow-hidden" style={{ height: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={input.imagePreviewUrl}
                alt="Design reference"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <X size={14} color="white" />
              </button>
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs"
                style={{ background: "rgba(0,0,0,0.6)", color: "var(--text-secondary)" }}
              >
                {input.imageFile?.name}
              </div>
            </div>
          ) : (
            <div
              className={`drop-zone flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all ${isDragOver ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--primary-glow)" }}
              >
                <Upload size={22} style={{ color: "var(--primary)" }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Drop image here or click to upload
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Photo, sketch, or hand-drawn design — JPG, PNG, WebP
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          {!input.imagePreviewUrl && (
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              The AI will analyze your image and describe the design automatically
            </p>
          )}
        </div>
      )}
    </div>
  );
}
