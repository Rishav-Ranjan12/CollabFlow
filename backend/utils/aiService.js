// Thin wrapper around the Anthropic Messages API.
// If ANTHROPIC_API_KEY is not set (or the call fails) callers fall back to
// local heuristics, so every AI feature keeps working offline.

const API_URL = "https://api.anthropic.com/v1/messages"

export const isAiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY)

export const askJson = async ({ system, prompt, maxTokens = 900 }) => {
  if (!isAiConfigured()) return null

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: maxTokens,
        system: `${system}\nRespond with a single valid JSON object only. No prose, no markdown fences.`,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      console.log("AI request failed:", response.status)
      return null
    }

    const data = await response.json()
    const text = data?.content?.find((part) => part.type === "text")?.text || ""
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch (error) {
    console.log("AI request error:", error.message)
    return null
  }
}
