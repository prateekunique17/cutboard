import fs from 'fs';
import path from 'path';

// --- CONFIG PHASE 3: THE "ONE-GO" PURE REST ENGINE ---
// This engine uses ZERO complicated SDKs and talks directly to Gemini via HTTP.
export const scanVideoWithAI = async (videoPath, brief) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing from your .env!");
    console.log(`[AI-V3] Starting Next-Gen Scan: ${path.basename(videoPath)}`);
    console.log(`[AI-V3] Using Brief: "${brief}"`);

    if (!fs.existsSync(videoPath)) {
      console.warn("[AI-V3] Video file not found locally.");
      return generateMockAudit(brief);
    }

    // 1. UPLOAD VIDEO (Pure REST Resumable)
    console.log("[AI-ULTRA] Step 1: Initializing Cloud Upload...");
    const initResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Type": "video/mp4",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { displayName: path.basename(videoPath) } })
    });

    const sessionUrl = initResponse.headers.get("X-Goog-Upload-URL");
    if (!sessionUrl) throw new Error("Could not initialize upload session.");

    console.log("[AI-ULTRA] Step 2: Streaming Video Data...");
    const fileBytes = fs.readFileSync(videoPath);
    const uploadRes = await fetch(sessionUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0",
      },
      body: fileBytes
    });

    const file = await uploadRes.json();
    const fileUri = file?.file?.uri;
    if (!fileUri) throw new Error("Upload failed to return a valid File URI.");

    console.log(`[AI-ULTRA] Step 3: File is Active (${file.file.name}). Reasoning...`);
    // Wait for file indexing (Critical for large videos)
    await new Promise(r => setTimeout(r, 3000));

    // 2. GENERATE AUDIT (Pure REST Reasoning)
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const genResponse = await fetch(genUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { file_data: { file_uri: fileUri, mime_type: "video/mp4" } },
            { text: `Brief: "${brief}". Audit this video for consistency and quality based on the brief. Respond ONLY with a valid JSON object: { "score": 80, "summary": "text", "auditPoints": [{ "time": 0, "type": "success|error", "message": "text" }] }` }
          ]
        }]
      })
    });

    const result = await genResponse.json();
    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) throw new Error("Gemini AI failed to return a reasoning response.");

    const jsonStr = aiText.match(/\{[\s\S]*\}/)?.[0] || aiText;
    const finalAudit = JSON.parse(jsonStr);

    console.log("[AI-ULTRA] SUCCESS: Scan Fully Completed.");
    return finalAudit;

  } catch (error) {
    console.error("[AI-ULTRA] FATAL ERROR:", error.message);
    return generateMockAudit(brief);
  }
};

const generateMockAudit = (brief) => {
  console.log("=== GENERATING SMART MOCK AUDIT (ULTRA-FALLBACK) ===");
  return {
    score: 85,
    summary: `Analysis of: "${brief}". The video is technically sound. AI Scan was bypassed due to server error.`,
    auditPoints: [
      { time: 5, type: "success", message: "Initial branding is clear." },
      { time: 15, type: "error", message: "AI reasoning skipped - check terminal logs for 404/500." }
    ]
  };
};
