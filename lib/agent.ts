import { JobType, SYSTEM_PROMPTS } from "./jobs";

export type AgentEvent =
  | { type: "step"; text: string }
  | { type: "token"; text: string }
  | { type: "error"; text: string };

// Free models with automatic fallback (OpenRouter tries the next one if a model is rate-limited).
// Set OPENROUTER_MODEL (e.g. anthropic/claude-haiku-5.5) to use a single paid model instead.
const MODELS = process.env.OPENROUTER_MODEL
  ? [process.env.OPENROUTER_MODEL]
  : ["nvidia/nemotron-3.5-lightning:free", "nvidia/nemotron-3.5-super-vl:free", "google/gemma-4-31b-it:free"];

async function fetchPageText(url: string): Promise<{ title: string; text: string }> {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Only http(s) URLs");
  const res = await fetch(u, {
    headers: { "User-Agent": "Mozilla/5.0 (HireAnAgent roast bot)" },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Site responded ${res.status}`);
  const html = (await res.text()).slice(0, 500_000);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
  return { title, text };
}

export async function* runAgent(jobType: JobType, input: string): AsyncGenerator<AgentEvent> {
  let userContent = input;

  if (jobType === "roast") {
    yield { type: "step", text: `Visiting ${input}` };
    try {
      const page = await fetchPageText(input);
      yield { type: "step", text: `Read ${page.text.length.toLocaleString()} characters${page.title ? ` from "${page.title.slice(0, 60)}"` : ""}` };
      userContent = `URL: ${input}\nTitle: ${page.title}\n\nPage text:\n${page.text}`;
    } catch (e) {
      yield { type: "step", text: `Couldn't load the page (${(e as Error).message}), roasting the URL alone` };
      userContent = `URL: ${input}\n(The page could not be loaded. Roast the URL/domain itself, and mention the site didn't even load.)`;
    }
    yield { type: "step", text: "Finding the weakest buzzwords" };
  } else if (jobType === "name") {
    yield { type: "step", text: "Brainstorming 50 names, throwing away 40" };
  } else {
    yield { type: "step", text: "Studying what goes viral" };
  }

  yield { type: "step", text: "Drafting" };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "Hire-an-Agent",
    },
    body: JSON.stringify({
      models: MODELS,
      stream: true,
      max_tokens: 700,
      reasoning: { enabled: false },
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[jobType] },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    yield { type: "error", text: `Model error ${res.status}: ${detail.slice(0, 200)}` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        if (json.error) {
          yield { type: "error", text: `Model error: ${json.error.message ?? "unknown"}` };
          return;
        }
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield { type: "token", text: delta };
      } catch {
        /* ignore keep-alive / partial lines */
      }
    }
  }
}
