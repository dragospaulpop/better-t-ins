import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ensureSessionData } from "@/lib/auth-utils";

export const Route = createFileRoute("/(app)/admin")({
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);
    const isLoggedIn = !!sessionData?.user;
    const isVerified = sessionData?.user.emailVerified;
    const isAdmin = sessionData?.user.role === "admin";

    if (isLoggedIn && isVerified) {
      if (!isAdmin) {
        redirect({
          to: "/dashboard",
          replace: true,
          throw: true,
        });
      }
    } else {
      redirect({
        to: "/login",
        replace: true,
        throw: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
