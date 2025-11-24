import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(app)")({
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
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-hidden p-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
