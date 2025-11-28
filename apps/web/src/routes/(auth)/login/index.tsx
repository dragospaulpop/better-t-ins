import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import AppTitle from "@/components/app-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-hooks";
import { ensureSessionData } from "@/lib/auth-utils";
import SignInForm from "@/routes/(auth)/login/-components/sign-in-form";
import SignUpForm from "@/routes/(auth)/login/-components/sign-up-form";
import VerifyEmailForm from "@/routes/(auth)/login/-components/verify-email-form";

export const Route = createFileRoute("/(auth)/login/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);

    const canAccess = sessionData?.user.emailVerified;

    if (canAccess) {
      redirect({
        to: "/dashboard",
        replace: true,
        throw: true,
      });
    }

    return { session: sessionData?.session, user: sessionData?.user };
  },
});

function RouteComponent() {
  const [tab, setTab] = useState<"sign-in" | "sign-up" | "verify-email">(
    "sign-in"
  );
  const [email, setEmail] = useState<string>("");
  const { user } = useSession();

  useEffect(() => {
    const visibleTab = user && !user.emailVerified ? "verify-email" : "sign-in";
    if (visibleTab === "verify-email") {
      setEmail(user?.email || "");
    }
    setTab(visibleTab);
  }, [user]);

  const handleSwitchToSignIn = () => {
    setTab("sign-in");
    setEmail("");
  };

  const handleSwitchToSignUp = () => {
    setTab("sign-up");
    setEmail("");
  };

  const handleSwitchToVerifyEmail = (loggedInEmail: string) => {
    setTab("verify-email");
    setEmail(loggedInEmail);
  };

  return (
    <div className="grid h-full min-h-0 place-items-center p-2">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AppTitle />
        <Tabs
          defaultValue={tab}
          onValueChange={(value) => {
            if (value === "sign-in") {
              handleSwitchToSignIn();
            } else if (value === "sign-up") {
              handleSwitchToSignUp();
            }
          }}
          value={tab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">
              <LogInIcon className="size-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="sign-up">
              <UserPlusIcon className="size-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignInForm
              onSwitchToSignUp={handleSwitchToSignUp}
              onSwitchToVerifyEmail={handleSwitchToVerifyEmail}
            />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUpForm onSwitchToSignIn={() => setTab("sign-in")} />
          </TabsContent>
          <TabsContent value="verify-email">
            <VerifyEmailForm
              email={email}
              onSwitchToSignIn={handleSwitchToSignIn}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
