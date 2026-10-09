// public/js/prompts.js
export const DAILY_PROMPTS = [
    { title: "React Performance Tuner", prompt: "Analyse the provided React component for unnecessary re-renders. Check for missing useMemo/useCallback and suggest state-lifting where appropriate." },
    { title: "Python Type Safety", prompt: "Convert the following Python script into a fully type-hinted version using Pydantic and runtime validation. Ensure all error cases are handled." },
    { title: "SQL Query Optimizer", prompt: "Rewrite this SQL query for maximum efficiency on PostgreSQL. Use CTEs instead of subqueries and check for missing index hints." },
    { title: "Tailwind Refactor", prompt: "Simplify the provided HTML structure by identifying repeated Tailwind utility classes and suggesting a clean abstraction (e.g., via @apply or component logic)." }
];

export function getPromptOfDay() {
    // Deterministic selection based on the date (1 day = 1 prompt)
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % DAILY_PROMPTS.length;
    return DAILY_PROMPTS[index];
}

export function generateRSS() {
    const prompt = getPromptOfDay();
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>ORF-Butler | Prompt of the Day</title>
  <link>https://projekt-orfb.local</link>
  <description>Daily high-precision prompts for ORF-Butler users</description>
  <item>
    <title>${prompt.title}</title>
    <link>https://projekt-orfb.local/potd</link>
    <description>${prompt.prompt}</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
  </item>
</channel>
</rss>`;
}
