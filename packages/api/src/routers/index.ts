import { protectedProcedure, publicProcedure, router } from "../index";
import { fileRouter } from "./file";
import { folderRouter } from "./folder";
import { profileRouter } from "./profile";
import { settingsRouter } from "./settings";
import { todoRouter } from "./todo";
import { usersRouter } from "./users";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(async ({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  todo: todoRouter,
  folder: folderRouter,
  file: fileRouter,
  profile: profileRouter,
  settings: settingsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
