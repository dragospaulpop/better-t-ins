import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { GlobeIcon, Loader, UsersIcon } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Whoops from "@/components/whoops";
import { ensureListUsersData } from "@/lib/auth-utils";
import AllowedDomainsTable from "./-components/allowed-domains-table";
import type { User } from "./-components/users/columns";
import UsersTable from "./-components/users-table";

export const Route = createFileRoute("/(app)/admin/settings/")({
  pendingComponent: () => <Loader />,
  errorComponent: ({ error }) => {
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();

    useEffect(() => {
      // Reset the query error boundary
      queryErrorResetBoundary.reset();
    }, [queryErrorResetBoundary]);

    const retry = () => {
      router.invalidate();
    };

    return <Whoops error={error} retry={retry} />;
  },
  loader: async ({ context }) => {
    const { users } = await ensureListUsersData(context);
    return { users: users as User[] };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { users } = Route.useLoaderData();

  return (
    <div className="mt-4 grid w-full place-items-center p-2">
      <Tabs className="w-full" defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <UsersIcon className="size-4" />
            <span className="hidden sm:block">Users</span>
          </TabsTrigger>
          <TabsTrigger value="allowed-domains">
            <GlobeIcon className="size-4" />
            <span className="hidden sm:block">Allowed domains</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="profile">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <UsersTable data={users} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="w-full" value="allowed-domains">
          <Card>
            <AllowedDomainsTable />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
