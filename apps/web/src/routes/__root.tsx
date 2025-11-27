import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { trpc } from "@/lib/trpc";
import "../index.css";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";

import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import type { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
  authClient: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "better-t-ins",
      },
      {
        name: "description",
        content: "better-t-ins is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // const isFetching = useRouterState({
  //   select: (s) => s.isLoading,
  // });

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_SITE_KEY as string}
          scriptProps={{ async: true, defer: true, appendTo: "body" }}
          useRecaptchaNet
        >
          <div className="flex min-h-screen w-full bg-background">
            <div className="flex min-h-0 flex-1 flex-col">
              <main className="min-h-0 flex-1 p-0">
                <Outlet />
              </main>
            </div>
          </div>
        </GoogleReCaptchaProvider>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: "TanStack Form",
            render: <FormDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
