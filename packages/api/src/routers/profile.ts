import { type AuthAPIWithPlugins, auth } from "@tud-box/auth";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../index";

const MINUTES = 5;
const SECONDS = 60;
const MILLISECONDS = 1000;
const MINUTES_5 = MINUTES * SECONDS * MILLISECONDS;

export const profileRouter = router({
  getBackupCodes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const isOldSession =
      ctx.session.session.createdAt < new Date(Date.now() - MINUTES_5);

    if (isOldSession) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Session too old. Login again to access this resource.",
      });
    }

    const { backupCodes } = await (
      auth.api as AuthAPIWithPlugins
    ).viewBackupCodes({
      body: {
        userId,
      },
    });

    return {
      backupCodes,
    };
  }),
});
