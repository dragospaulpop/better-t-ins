import { protectedProcedure, publicProcedure, router } from "../index";
import { todoRouter } from "./todo";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(async ({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  todo: todoRouter,
  profile: protectedProcedure.query(async ({ ctx }) => ({
    message: "This is profile",
    user: ctx.session.user,
  })),
});
export type AppRouter = typeof appRouter;
