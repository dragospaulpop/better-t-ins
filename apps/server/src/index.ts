import { createContext } from "@better-t-ins/api/context";
import { appRouter } from "@better-t-ins/api/routers/index";
import { auth } from "@better-t-ins/auth";
import { trpcServer } from "@hono/trpc-server";
import "dotenv/config";
import { router as uploadRouter } from "@better-t-ins/storage/router";
import { handleRequest } from "@better-upload/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import protect from "./arcjet";

const RATE_LIMIT_EXCEEDED_STATUS = 429;
const EMAIL_INVALID_STATUS = 400;
const FORBIDDEN_STATUS = 403;

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-captcha-response"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }
    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  }
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const decision = await protect(c);

  if (decision.isDenied()) {
    // console.log(decision.reason);
    if (decision.reason.isRateLimit()) {
      return c.json(
        { message: "Rate limit exceeded" },
        RATE_LIMIT_EXCEEDED_STATUS
      );
    }
    if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "Your email domain does not have an MX record. Is there a typo?";
      } else {
        // This is a catch all, but the above should be exhaustive based on the
        // configured rules.
        message = "Invalid email.";
      }

      return c.json({ message }, EMAIL_INVALID_STATUS);
    }
    return c.json({ message: "Forbidden" }, FORBIDDEN_STATUS);
  }
  return auth.handler(c.req.raw);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => createContext({ context }),
  })
);

app.post("/upload", (c) => handleRequest(c.req.raw, uploadRouter));

app.get("/", (c) => c.text("OK"));

export default app;
