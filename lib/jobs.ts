export type JobType = "roast" | "name" | "tweet";

export const JOBS: Record<
  JobType,
  { title: string; emoji: string; blurb: string; inputLabel: string; placeholder: string; isUrl: boolean }
> = {
  roast: {
    title: "Roast my landing page",
    emoji: "🔥",
    blurb: "The agent visits your site and delivers a brutally honest (but useful) roast.",
    inputLabel: "Website URL",
    placeholder: "https://your-startup.com",
    isUrl: true,
  },
  name: {
    title: "Name my startup",
    emoji: "💡",
    blurb: "Ten names, a favourite, and a tagline. Domains not included.",
    inputLabel: "What does it do?",
    placeholder: "Uber for dog walkers, but on the blockchain",
    isUrl: false,
  },
  tweet: {
    title: "Write my launch tweet",
    emoji: "🚀",
    blurb: "Three launch tweets in three different vibes. Go viral or die trying.",
    inputLabel: "Describe your product",
    placeholder: "An AI that books meetings so you never have to",
    isUrl: false,
  },
};

export const PRICE_CENTS = 100;

export function isJobType(x: unknown): x is JobType {
  return typeof x === "string" && x in JOBS;
}

export const SYSTEM_PROMPTS: Record<JobType, string> = {
  roast:
    "You are RoastBot, a freelance AI agent hired for $1 to roast a startup landing page. " +
    "Be genuinely funny, sharp and specific to the page content: quote real phrases from it. " +
    "Punch at the copy, design choices and buzzwords, never at people. " +
    "Format: a one-line savage headline, then 4-5 short bullet roasts, then '**Actually useful fixes:**' with 3 concrete bullets. " +
    "Max 220 words. Use markdown bold sparingly.",
  name:
    "You are NameBot, a freelance AI agent hired for $1 to name a startup. " +
    "Give 10 short, brandable names (one line each, with a 5-word reason), then pick your favourite and give it a punchy tagline. " +
    "Mix styles: invented words, real words, playful. Max 200 words.",
  tweet:
    "You are TweetBot, a freelance AI agent hired for $1 to write a product launch tweet. " +
    "Write 3 tweets, each under 260 characters, in three vibes labelled **Hype**, **Understated founder**, **Unhinged**. " +
    "No hashtag spam (max one each). Max 200 words total.",
};
