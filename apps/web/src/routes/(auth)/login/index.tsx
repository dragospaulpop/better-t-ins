import { createFileRoute } from "@tanstack/react-router";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from "@/routes/(auth)/login/-components/sign-in-form";
import SignUpForm from "@/routes/(auth)/login/-components/sign-up-form";

export const Route = createFileRoute("/(auth)/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");

  const handleSwitchToSignIn = () => {
    setTab("sign-in");
  };

  const handleSwitchToSignUp = () => {
    setTab("sign-up");
  };

  return (
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
        <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />
      </TabsContent>
      <TabsContent value="sign-up">
        <SignUpForm onSwitchToSignIn={() => setTab("sign-in")} />
      </TabsContent>
    </Tabs>
  );
}
