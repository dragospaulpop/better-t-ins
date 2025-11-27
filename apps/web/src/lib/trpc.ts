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
const MAX_RETRY_COUNT = 3;
const ONE_MINUTE_MS = 60_000;
const STALE_TIME_MS = ONE_MINUTE_MS;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries for faster error feedback during development
      // You can adjust this for production
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (
          (error as TRPCClientError<AppRouter>)?.data?.code ===
          UNAUTHORIZED_ERROR_CODE
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < MAX_RETRY_COUNT;
      },
      // How long until data is considered stale
      staleTime: STALE_TIME_MS,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for background refetch errors
      // Initial load errors are handled by route error boundaries
      // We check if the query has data - if it does, this is a background refetch error
      if (query.state.data !== undefined) {
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
                // Refetch this specific query instead of invalidating all
                query.fetch();
              },
            },
          });
        }
      }
      // If query.state.data is undefined, this is an initial load error
      // Let the route error boundary handle it
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
