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
import { pacerDevtoolsPlugin } from "@tanstack/react-pacer-devtools";

import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import NotFound from "@/components/not-found";
import RouterError from "@/components/router-error";
import type { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
  authClient: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  errorComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <RouterError messages={["An error occured"]} title="An error occured" />
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex h-full w-full items-center justify-center">
      <NotFound />
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: "TUDBox",
      },
      {
        name: "description",
        content: "TUDBox is a file storage application from TUD",
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
          pacerDevtoolsPlugin(),
        ]}
      />
    </>
  );
}
