import type { AllowedHost } from "@better-t-ins/db/schema/settings";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { GlobeIcon, Loader, UsersIcon } from "lucide-react";
import { useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Whoops from "@/components/whoops";
import { useListUsers } from "@/lib/auth-hooks";
import AddDomainDialog from "./-components/allowed-domains/add-domain-dialog";
import AllowedDomainsTable from "./-components/allowed-domains-table";
import AddUserDialog from "./-components/users/add-user-dialog";
import type { User } from "./-components/users/columns";
import UsersTable from "./-components/users-table";

type SerializedAllowedHost = Omit<AllowedHost, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

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
  loader: async ({ context: { queryClient, authClient, trpc } }) => {
    const [{ users }, { allowedHosts }] = await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["list-users"],
        queryFn: () =>
          authClient.admin.listUsers({
            query: {},
            fetchOptions: { throw: true },
          }),
      }),
      queryClient.ensureQueryData(
        trpc.settings.getAllowedDomains.queryOptions()
      ),
    ]);
    return {
      users: users as User[],
      serializedAllowedHosts: allowedHosts as SerializedAllowedHost[],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { trpc } = Route.useRouteContext();
  const { data: { users = [] } = {} } = useListUsers() as {
    data: { users: User[] };
  };
  const { data: serializedAllowedHosts } = useSuspenseQuery(
    trpc.settings.getAllowedDomains.queryOptions()
  );

  const allowedHosts = serializedAllowedHosts.allowedHosts.map(
    (allowedHost) => ({
      ...allowedHost,
      createdAt: new Date(allowedHost.createdAt),
      updatedAt: new Date(allowedHost.updatedAt),
    })
  );

  return (
    <div className="mt-4 grid w-full place-items-center overflow-hidden p-2">
      <Tabs className="w-full min-w-0" defaultValue="profile">
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
        <TabsContent className="w-full min-w-0" value="profile">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardHeader>
              <CardAction>
                <AddUserDialog />
              </CardAction>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage users and their permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full min-w-0 overflow-hidden">
              <UsersTable data={users} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="w-full" value="allowed-domains">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardHeader>
              <CardAction>
                <AddDomainDialog />
              </CardAction>
              <CardTitle>Hosts</CardTitle>
              <CardDescription>
                Manage allowed hosts and their permissions. This are the domains
                that are allowed to sign up for an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full min-w-0 overflow-hidden">
              <AllowedDomainsTable data={allowedHosts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
