import { db } from "@better-t-ins/db";
import { user } from "@better-t-ins/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../index";

export const usersRouter = router({
  validateEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const email = input.email;

      const exists = await emailAlreadyExists(email);

      return exists;
    }),
});

async function emailAlreadyExists(email: string): Promise<boolean> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result.length > 0;
}
