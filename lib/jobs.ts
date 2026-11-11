export type JobType = "roast" | "name" | "tweet";

export const JOBS: Record<
  JobType,
  {
    title: string;
    short: string;
    emoji: string;
    blurb: string;
    inputLabel: string;
    placeholder: string;
    isUrl: boolean;
  }
> = {
  roast: {
    title: "Roast my landing page",
    short: "Landing page roast",
    emoji: "🔥",
    blurb: "Honest, funny feedback on your homepage, plus three fixes you can ship today.",
    inputLabel: "Your website",
    placeholder: "yourstartup.com",
    isUrl: true,
  },
  name: {
    title: "Name my startup",
    short: "Startup names",
    emoji: "💡",
    blurb: "Ten names that don't sound like every other startup, and a tagline for the best one.",
    inputLabel: "What does your startup do?",
    placeholder: "Helps dog walkers find clients nearby",
    isUrl: false,
  },
  tweet: {
    title: "Write my launch tweet",
    short: "Launch tweets",
    emoji: "🚀",
    blurb: "Three launch posts in three tones, from polished to a little unhinged.",
    inputLabel: "What are you launching?",
    placeholder: "A calendar that books meetings for you",
    isUrl: false,
  },
};

export const PRICE_CENTS = 100;

export function isJobType(x: unknown): x is JobType {
  return typeof x === "string" && x in JOBS;
}

export const SYSTEM_PROMPTS: Record<JobType, string> = {
  roast:
    "You are a sharp, funny startup advisor hired for $1 to roast a landing page. " +
    "Be specific to the page content: quote real phrases from it. " +
    "Punch at the copy, design choices and buzzwords, never at people. " +
    "Format: a one-line headline verdict, then 4-5 short bullet roasts, then '**Three fixes:**' with 3 concrete bullets. " +
    "Max 220 words. Use markdown bold sparingly. No emoji.",
  name:
    "You are a brand strategist hired for $1 to name a startup. " +
    "Give 10 short, brandable names as bullets (name in bold, then a 5-word reason), then '**My pick:**' with your favourite and a punchy tagline. " +
    "Mix styles: invented words, real words, playful. Max 200 words. No emoji.",
  tweet:
    "You are a launch copywriter hired for $1 to write launch posts. " +
    "Write 3 posts, each under 260 characters, labelled **Polished**, **Founder voice**, **Unhinged**. " +
    "Max one hashtag each. Max 200 words total.",
};
