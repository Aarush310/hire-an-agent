# 🤖 Hire-an-Agent

**Pay an AI agent $1 to do a job live, and only get charged if you like the work.**

Pick a job (🔥 roast my landing page, 💡 name my startup, 🚀 write my launch tweet), check out with Stripe, and watch the agent work step by step. Your $1 is only **authorized**, not charged. Hit **Accept** and the payment is captured. Hit **Reject** and the hold is released. Every finished job shows up on a public **live wall** with the agent's running earnings and a QR code, so a whole room can hire it at once.

It's a small working model of how agents could be paid for work: escrow-style payments where the customer approves the output before any money moves.

## How it works

| Step | What happens |
|---|---|
| Hire | Stripe Checkout with `capture_method: manual`. The card is authorized for $1 |
| Work | The server checks that the payment is authorized, then the agent streams its steps and output (OpenRouter) |
| Deliver | The result is saved to the PaymentIntent's metadata. **Stripe is the database** |
| Decide | Accept → `paymentIntents.capture`. Reject → `paymentIntents.cancel` |
| Wall | Lists this app's PaymentIntents, shows results and accept/reject status, and totals the captured earnings |

## Stack (provisioned with Stripe Projects)

- **Stripe** for payments (test mode) and job storage
- **OpenRouter** for the LLM, with automatic fallback across models
- **Vercel** for hosting
- **Next.js 15** (App Router, streaming route handlers)

## Run locally

```bash
stripe projects env --pull   # writes OPENROUTER_API_KEY, STRIPE_SECRET_KEY, … to .env
npm install
npm run dev
```

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Built at Agentic Dev Day with [Stripe Projects](https://projects.dev).
