import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomeComponent,
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
    redirect({
      to: "/dashboard",
      replace: true,
      throw: true,
    });
  },
});

function HomeComponent() {
  return (
    <div className="container mx-auto h-full max-w-3xl px-4 py-2">
      <div className="grid h-full min-h-0 place-items-center gap-6">
        <section className="rounded-lg border p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircleIcon className="text-destructive" />
              </EmptyMedia>
              <EmptyTitle>You shouldn't be here</EmptyTitle>
              <EmptyDescription>
                You should have been redirected to either the login page or the
                dashboard page.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/login">Go to Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </section>
      </div>
    </div>
  );
}
