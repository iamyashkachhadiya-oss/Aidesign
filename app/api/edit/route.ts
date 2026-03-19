import { NextResponse } from "next/server";
import { MachineConfig } from "@/lib/types";
import { generateMockEdit } from "@/lib/mock-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, originalImageUrl, instruction, colors } = body as {
      config: MachineConfig;
      originalImageUrl: string;
      instruction: string;
      colors: string[];
    };

    if (!config || !instruction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Real Stability AI img2img edit if key available
    if (process.env.STABILITY_API_KEY) {
      const { buildEditPrompt } = await import("@/lib/prompt-builder");
      const { validateDesign, deriveMockSpec } = await import("@/lib/constraint-engine");
      const fullPrompt = buildEditPrompt(instruction, instruction, config, colors);

      const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        body: (() => {
          const fd = new FormData();
          fd.append("prompt", fullPrompt);
          fd.append("model", "sd3-medium");
          fd.append("output_format", "png");
          return fd;
        })(),
      });
      if (!res.ok) throw new Error(`Stability AI error: ${res.status}`);
      const data = await res.json();
      const updatedImageUrl = `data:image/png;base64,${data.image}`;
      const spec = deriveMockSpec(config);
      const validation = validateDesign(spec, config);
      return NextResponse.json({ updatedImageUrl, validation });
    }

    // Mock edit
    const updatedImageUrl = await generateMockEdit(originalImageUrl, instruction, config, colors);
    return NextResponse.json({ updatedImageUrl });
  } catch (error) {
    console.error("Edit API error:", error);
    return NextResponse.json(
      { error: "Failed to apply edits. Please try again." },
      { status: 500 }
    );
  }
}
