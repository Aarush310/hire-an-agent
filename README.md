# Hire-an-Agent

**An AI agent that gets paid only when its work is good.**

🔗 **Live demo:** https://hire-an-agent-smoky.vercel.app · 📺 **Live board:** https://hire-an-agent-smoky.vercel.app/wall

Built in about 30 minutes at **Agentic Dev Day** with **Stripe Projects**.

---

## The problem

Agents are starting to do real work for people, but paying them is still clumsy. You either pay upfront and hope the output is good, or you don't pay at all. People and agents need a fair way to pay for agent work.

## The idea

Hire-an-Agent is a small marketplace where you hire an AI agent for $1:

| Job | You give it | You get back |
|---|---|---|
| Roast my landing page | A URL | A specific, funny roast of your homepage copy, plus 3 fixes you can ship |
| Name my startup | A one-line pitch | 10 brandable names, a top pick and a tagline |
| Write my launch tweet | What you're launching | 3 launch posts in 3 tones |

**The key part is escrow.** Your $1 is held on your card, not charged. You watch the agent work live, then decide:

- ✅ **Accept** → Stripe captures the payment and the agent gets paid
- ❌ **Reject** → Stripe cancels the hold and you pay nothing

The agent only earns when the customer approves its work. That's a simple, fair model for paying agents, and it runs on standard Stripe features.

## Try it in 30 seconds

1. Open the [live demo](https://hire-an-agent-smoky.vercel.app)
2. Pick **Roast my landing page** and type any site, e.g. `notion.so`
3. Click **⚡ Instant demo pay**. This places the hold with Stripe's test Visa, so you don't need to type a card. The normal **Start for $1** button goes through Stripe Checkout instead (test card `4242 4242 4242 4242`).
4. Watch the agent's steps and the roast stream in live
5. Click **Yes, pay $1** or **No thanks**
6. Open the [live board](https://hire-an-agent-smoky.vercel.app/wall). Your job is there, and the agent's earnings counter goes up

Test mode throughout, so no real money moves.

## How it works

```
 Customer ──► Stripe Checkout (capture_method: manual) ──► $1 authorized, NOT charged
                                                              │
                         server verifies status = requires_capture
                                                              │
                     Agent runs ◄─────────────────────────────┘
                     • fetches & reads the URL server-side
                     • streams its steps + output (OpenRouter LLM)
                     • saves the deliverable onto the PaymentIntent metadata
                                                              │
         Accept ──► paymentIntents.capture()   → agent is paid
         Reject ──► paymentIntents.cancel()    → hold released
                                                              │
                     Live board lists the PaymentIntents ◄────┘
                     → jobs, accept rate, total earnings
```

**Design decisions**

- **Stripe is the database.** Each job and its result live in the PaymentIntent's metadata (chunked to stay under the 500-character limit), so payments and work records can't drift apart, and no separate database is needed.
- **Work only starts once money is committed.** The agent runs only after the server confirms the payment is authorized (`requires_capture`).
- **A result can't be produced twice.** If you reload the job page, it reads the saved result back from Stripe instead of calling the model again.
- **Fallback across models.** The agent sends a list of models to OpenRouter, so if one is rate-limited, the next one takes over.
- **Built for the room.** The layout works on phones, and the live board has a QR code, so an audience can scan it and hire the agent together.

## Stack, all set up with Stripe Projects

| Layer | Provider | Set up with |
|---|---|---|
| Payments + job storage | **Stripe** (sandbox) | `stripe projects add stripe/sandbox` |
| AI model | **OpenRouter** | `stripe projects add openrouter/api` |
| Hosting | **Vercel** | `stripe projects add vercel/project` |
| App | Next.js 15 (App Router, streaming route handlers), TypeScript | |

Getting from an empty folder to all three providers with their keys in `.env` took about 4 commands: `stripe projects init`, `stripe projects add …`, then `stripe projects env --pull`.

## Code tour

| File | What it does |
|---|---|
| `app/api/checkout/route.ts` | Creates a Checkout Session with manual capture (or an instant demo hold with the test card) |
| `app/api/run/route.ts` | Verifies the hold, runs the agent, streams NDJSON events and saves the result to Stripe |
| `app/api/decide/route.ts` | Accept → capture, reject → cancel |
| `app/api/wall/route.ts` | Builds the live board from PaymentIntents: earnings, accept rate and feed |
| `lib/agent.ts` | The agent: fetches the page, cleans its text, streams from the LLM with model fallback |
| `app/job/[id]/page.tsx` | Receipt-style job page showing progress steps, streamed result and the accept/reject choice |
| `app/wall/` | Live board for the big screen, with a QR code to try it |

## Run locally

```bash
stripe projects env --pull   # OPENROUTER_API_KEY, STRIPE_SECRET_KEY, Vercel vars → .env
npm install
npm run dev                  # http://localhost:3000
```

Optional: set `OPENROUTER_MODEL=anthropic/claude-haiku-5.5` to use a single paid model instead of the free fallback chain.

## What's next

- **Agent P&L:** subtract each job's model cost (OpenRouter reports it) from earnings, so the agent visibly pays for its own compute
- **Tiers and tips:** a $3 "Brutal mode" and a tip button after accepting
- **Agent-to-agent hiring:** let other agents call the same API and pay through the same hold-then-capture flow
- **Shareable roast pages** with preview images for social sharing

---

Made by Aarush Prasad at Agentic Dev Day · `agentic-dev-day`
