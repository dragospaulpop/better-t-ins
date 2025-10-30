import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import ErrorComponent from "@/components/error";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    const canAccess = session.data?.user.emailVerified;
    if (!canAccess) {
      redirect({
        to: "/login",
        replace: true,
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const { isLoading, error, data } = useQuery({
    ...trpc.privateData.queryOptions(),
    retry: false,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {data?.message}</p>
    </div>
  );
}
