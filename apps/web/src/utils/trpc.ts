import type { AppRouter } from "@better-t-ins/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  type TRPCClientError,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

const UNAUTHORIZED_ERROR_CODE = "UNAUTHORIZED" as const;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (
        (error as TRPCClientError<AppRouter>)?.data?.code ===
        UNAUTHORIZED_ERROR_CODE
      ) {
        toast.error(error.message);
      } else {
        toast.error(error.message, {
          action: {
            label: "retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
      }
    },
  }),
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
