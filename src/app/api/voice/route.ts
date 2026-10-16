export const runtime = "nodejs";

// Reads a short explanation aloud with ElevenLabs. Without a key the client uses the browser's voice.
export async function GET(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return new Response("ElevenLabs not configured", { status: 501 });
  const text = (new URL(req.url).searchParams.get("text") ?? "").slice(0, 400);
  if (!text) return new Response("Missing text", { status: 400 });
  const voice = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2" }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return new Response("Voice service error", { status: 502 });
  return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
