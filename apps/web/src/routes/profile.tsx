import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const profile = useQuery(trpc.profile.queryOptions());

  return (
    <div className="p-2">
      <h1>Profile</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {profile.data?.message}</p>
    </div>
  );
}
