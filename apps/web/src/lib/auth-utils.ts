import type { RouterAppContext } from "@/routes/__root";

const ONE_SECOND_MS = 1000;
const SESSION_STALE_TIME = 60 * ONE_SECOND_MS;

export async function ensureSessionData({
  queryClient,
  authClient,
}: Pick<RouterAppContext, "queryClient" | "authClient">) {
  const sessionData = await queryClient.ensureQueryData({
    queryKey: ["session"],
    queryFn: () => authClient.getSession({ fetchOptions: { throw: true } }),
    staleTime: SESSION_STALE_TIME,
  });
  return sessionData;
}

export async function ensureListUsersData({
  queryClient,
  authClient,
}: Pick<RouterAppContext, "queryClient" | "authClient">) {
  const usersData = await queryClient.ensureQueryData({
    queryKey: ["list-users"],
    queryFn: () =>
      authClient.admin.listUsers({ query: {}, fetchOptions: { throw: true } }),
  });
  return usersData;
}
