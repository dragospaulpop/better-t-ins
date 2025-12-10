// Disable SSL verification for self-signed certificates in development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { createContext } from "@tud-box/api/context";
import { appRouter } from "@tud-box/api/routers/index";
import { auth } from "@tud-box/auth";
import { trpcServer } from "@hono/trpc-server";
import "dotenv/config";
import { Readable } from "node:stream";
import buildPaths from "@tud-box/api/lib/folders/build-paths";
import { getFolderTreeFlat } from "@tud-box/api/lib/folders/get-folder-tree-flat";
import { and, db, eq } from "@tud-box/db";
import { folder } from "@tud-box/db/schema/upload";
import { storage } from "@tud-box/storage";
import { router as uploadRouter } from "@tud-box/storage/router";
import { handleRequest } from "@better-upload/server";
import archiver from "archiver";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import z from "zod";
import protect from "./arcjet";

const RATE_LIMIT_EXCEEDED_STATUS = 429;
const EMAIL_INVALID_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;

const envSchema = z.object({
  CORS_ORIGIN: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error("Invalid environment variables", {
    cause: env.error,
  });
}

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
    origin: env.data.CORS_ORIGIN,
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

app.get("/download/folder/:id", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, UNAUTHORIZED_STATUS);
  }

  const folderId = Number.parseInt(c.req.param("id"), 10);

  if (Number.isNaN(folderId)) {
    return c.json({ message: "Invalid folder ID" }, BAD_REQUEST_STATUS);
  }

  // Verify folder ownership
  const folderRecord = await db
    .select()
    .from(folder)
    .where(and(eq(folder.id, folderId), eq(folder.owner_id, user.id)))
    .limit(1);

  if (folderRecord.length === 0) {
    return c.json({ message: "Folder not found" }, NOT_FOUND_STATUS);
  }

  const folderName = folderRecord[0]?.name ?? "Untitled Folder";
  const { folders, files } = await getFolderTreeFlat(db, folderId, user.id);
  const paths = buildPaths(folders);

  const archive = archiver("zip", { zlib: { level: 9 } });

  // Append each file's content from storage
  for (const file of files) {
    const folderPath = file.folderId ? (paths.get(file.folderId) ?? "") : "";

    const fileStream = await storage.client.getObject(
      storage.bucketName,
      file.s3Key
    );
    archive.append(fileStream, { name: `${folderPath}/${file.fileName}` });
  }

  // Don't await - let it finalize while streaming
  archive.finalize();

  // Convert Node.js Readable to Web ReadableStream
  const webStream = Readable.toWeb(archive) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
});

app.get("/", (c) => c.text("OK"));

export default app;
