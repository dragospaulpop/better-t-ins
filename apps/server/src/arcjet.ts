import arcjet, {
  type ArcjetDecision,
  type BotOptions,
  detectBot,
  type EmailOptions,
  type ProtectSignupOptions,
  protectSignup,
  type SlidingWindowRateLimitOptions,
  shield,
  slidingWindow,
} from "@arcjet/bun";
import { findIp } from "@arcjet/ip";
import type { Context } from "hono";
import { cloneRawRequest } from "hono/request";

// The arcjet instance is created outside of the handler
const aj = arcjet({
  key: process.env.ARCJET_KEY || "", // Get your site key from https://app.arcjet.com
  characteristics: ["userId"],
  rules: [
    // Protect against common attacks with Arcjet Shield. Other rules are
    // added dynamically using `withRule`.
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

const emailOptions = {
  mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
  // Block emails that are disposable, invalid, or have no MX records
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
  mode: "LIVE",
  // configured with a list of bots to allow from
  // https://arcjet.com/bot-list
  allow: ["CATEGORY:SEARCH_ENGINE"], // prevents bots from submitting the form
} satisfies BotOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m", // counts requests over a 2 minute sliding window
  max: 5, // allows 5 submissions within the window
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: emailOptions,
  // uses a sliding window rate limit
  bots: botOptions,
  // It would be unusual for a form to be submitted more than 5 times in 10
  // minutes from the same IP address
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

export default async function protect(c: Context): Promise<ArcjetDecision> {
  const session = c.get("session");

  const ip =
    c.req.header("X-Forwarded-For")?.split(",")?.[0]?.trim() ||
    c.req.header("X-Real-IP") ||
    findIp(c.req.raw) ||
    "127.0.0.1";

  console.log(ip);
  console.log(c.req.header());

  const userId = session?.userId ?? ip;

  // If this is a signup then use the special protectSignup rule
  // See https://docs.arcjet.com/signup-protection/quick-start
  if (c.req.path.startsWith("/api/auth/sign-up")) {
    // Better-Auth reads the body, so we need to clone the request preemptively
    const clonedReq = await cloneRawRequest(c.req);
    const body = (await clonedReq.json()) as { email: string };

    // If the email is in the body of the request then we can run
    // the email validation checks as well. See
    // https://www.better-auth.com/docs/concepts/hooks#example-enforce-email-domain-restriction
    if (typeof body.email === "string") {
      return aj
        .withRule(protectSignup(signupOptions))
        .protect(c.req.raw, { email: body.email, userId });
    }
    // Otherwise use rate limit and detect bot
    return aj
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(rateLimitOptions))
      .protect(c.req.raw, { userId });
  }
  // For all other auth requests
  return aj.withRule(detectBot(botOptions)).protect(c.req.raw, { userId });
}
