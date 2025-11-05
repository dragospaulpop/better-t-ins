import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import SignInForm from "@/routes/login/-components/sign-in-form";
import SignUpForm from "@/routes/login/-components/sign-up-form";
import VerifyEmailForm from "@/routes/login/-components/verify-email-form";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();

    const canAccess = session.data?.user.emailVerified;
    if (canAccess) {
      redirect({
        to: "/dashboard",
        replace: true,
        throw: true,
      });
    }

    return { session };
  },
});

function RouteComponent() {
  const [tab, setTab] = useState<"sign-in" | "sign-up" | "verify-email">(
    "sign-in"
  );
  const [email, setEmail] = useState<string>("");
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const visibleTab =
      session && !session?.user.emailVerified ? "verify-email" : "sign-in";
    if (visibleTab === "verify-email") {
      setEmail(session?.user.email || "");
    }
    setTab(visibleTab);
  }, [session]);

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
    <div className="grid place-items-center p-2">
      <div className="flex h-full max-h-1/2 w-full max-w-sm flex-col gap-6">
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
