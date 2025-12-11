import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import AppTitle from "@/components/app-title";
import { ensureSessionData } from "@/lib/auth-utils";

export const Route = createFileRoute("/(auth)/login")({
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);

    const user = sessionData?.user;
    const isLoggedIn = !!user;
    const isVerified = user?.emailVerified;

    if (isLoggedIn) {
      if (isVerified) {
        redirect({
          to: "/dashboard",
          replace: true,
          throw: true,
        });
      } else {
        redirect({
          to: "/verify-email",
          replace: true,
          throw: true,
        });
      }
    }

    return { session: sessionData?.session, user: sessionData?.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  return (
    <div className="grid h-full min-h-0 place-items-center p-2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <AppTitle />
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_SITE_KEY as string}
          scriptProps={{ async: true, defer: true, appendTo: "body" }}
          useRecaptchaNet
        >
          <Outlet />
        </GoogleReCaptchaProvider>
      </div>
    </div>
  );
}
