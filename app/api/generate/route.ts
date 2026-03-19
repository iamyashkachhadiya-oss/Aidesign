import { NextResponse } from "next/server";
import { MachineConfig } from "@/lib/types";
import { generateMockVariations } from "@/lib/mock-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, prompt, imageBase64 } = body as {
      config: MachineConfig;
      prompt: string;
      imageBase64?: string;
    };

    if (!config || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: config and prompt" },
        { status: 400 }
      );
    }

    // If Gemini API key exists, use it to analyze the uploaded image
    let enrichedPrompt = prompt;
    if (imageBase64 && process.env.GEMINI_API_KEY) {
      try {
        const { buildImageAnalysisPrompt } = await import("@/lib/prompt-builder");
        const analysisPrompt = buildImageAnalysisPrompt(config);
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: analysisPrompt },
                  { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
                ],
              }],
            }),
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const extracted = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (extracted) enrichedPrompt = extracted;
        }
      } catch (e) {
        console.warn("Gemini image analysis failed, using original prompt:", e);
      }
    }

    // If Stability AI key exists, use real generation; otherwise use mock
    if (process.env.STABILITY_API_KEY) {
      // Real Stability AI generation (for when key is available)
      const { buildGenerationPrompt } = await import("@/lib/prompt-builder");
      const { validateDesign, deriveMockSpec } = await import("@/lib/constraint-engine");

      const variations = await Promise.all(
        [0, 1, 2].map(async (i) => {
          const fullPrompt = buildGenerationPrompt(enrichedPrompt, config, i as 0 | 1 | 2);
          const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              Accept: "application/json",
            },
            body: (() => {
              const fd = new FormData();
              fd.append("prompt", fullPrompt);
              fd.append("negative_prompt", "blurry, low quality, flat color, plain, no texture");
              fd.append("model", "sd3-medium");
              fd.append("output_format", "png");
              return fd;
            })(),
          });

          if (!res.ok) throw new Error(`Stability AI error: ${res.status}`);
          const data = await res.json();
          const imageUrl = `data:image/png;base64,${data.image}`;
          const spec = deriveMockSpec(config);
          const validation = validateDesign(spec, config);
          return {
            id: `var-${i}-${Date.now()}`,
            index: i,
            imageUrl,
            prompt: fullPrompt,
            validation,
            colors: spec.colors,
          };
        })
      );
      return NextResponse.json({ variations });
    }

    // Mock generation (no API key)
    const variations = await generateMockVariations(config, enrichedPrompt);
    return NextResponse.json({ variations });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate designs. Please try again." },
      { status: 500 }
    );
  }
}
