import { db } from "@better-t-ins/db";
import { user } from "@better-t-ins/db/schema/auth";
import { allowedHost } from "@better-t-ins/db/schema/settings";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../index";
import { deleteHost } from "../lib/settings/delete-host";
import { insertHost } from "../lib/settings/insert-host";
import { updateHost } from "../lib/settings/update-host";

export const settingsRouter = router({
  getAllowedDomains: adminProcedure.query(async () => {
    const allowedHosts = await db
      .select({
        host: allowedHost.host,
        description: allowedHost.description,
        enabled: allowedHost.enabled,
        addedBy: user.name,
        createdAt: allowedHost.createdAt,
        updatedAt: allowedHost.updatedAt,
      })
      .from(allowedHost)
      .leftJoin(user, eq(allowedHost.addedBy, user.id));

    return {
      allowedHosts,
    };
  }),

  validateHostName: adminProcedure
    .input(
      z.object({
        host: z.string().min(1).regex(z.regexes.domain, "Invalid host name"),
      })
    )
    .mutation(async ({ input }) => {
      const host = input.host;

      const exists = await hostAlreadyExists(host);

      return exists;
    }),

  create: adminProcedure
    .input(
      z.object({
        host: z.string().min(1).regex(z.regexes.domain),
        description: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await insertHost(db, input.host, input.description, userId);
    }),

  updateHost: adminProcedure
    .input(
      z.object({
        host: z.string().min(1).regex(z.regexes.domain),
        description: z.string().min(1),
        enabled: z.boolean(),
      })
    )
    .mutation(
      async ({ input }) =>
        await updateHost(db, input.host, input.description, input.enabled)
    ),
  deleteHost: adminProcedure
    .input(
      z.object({
        host: z.string().min(1).regex(z.regexes.domain),
      })
    )
    .mutation(async ({ input }) => await deleteHost(db, input.host)),
});

async function hostAlreadyExists(host: string): Promise<boolean> {
  const result = await db
    .select()
    .from(allowedHost)
    .where(eq(allowedHost.host, host))
    .limit(1);
  return result.length > 0;
}
