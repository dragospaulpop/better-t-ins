import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import z from "zod";
import Loader from "./components/loader";
import { authClient } from "./lib/auth-client";
import { routeTree } from "./routeTree.gen";
import { queryClient, trpc } from "./utils/trpc";

const envSchema = z.object({
  VITE_SERVER_URL: z.string(),
  VITE_APP_NAME: z.string(),
  VITE_RECAPTCHA_SITE_KEY: z.string(),
});

const env = envSchema.safeParse(import.meta.env);

if (!env.success) {
  throw new Error("Invalid environment variables", {
    cause: env.error,
  });
}

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: { trpc, queryClient, authClient },
  Wrap({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
