// The model sometimes wraps its JSON in a Markdown code fence (```json … ```)
// even when told to return only JSON, so the fence is removed first.
export function parseAiJson(content: string): unknown {
  const cleanedContent = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  return JSON.parse(cleanedContent);
}
