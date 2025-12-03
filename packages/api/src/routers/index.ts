import { protectedProcedure, publicProcedure, router } from "../index";
import { folderRouter } from "./folder";
import { profileRouter } from "./profile";
import { settingsRouter } from "./settings";
import { todoRouter } from "./todo";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(async ({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  todo: todoRouter,
  folder: folderRouter,
  profile: profileRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
