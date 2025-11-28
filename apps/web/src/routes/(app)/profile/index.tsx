import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { KeyIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Whoops from "@/components/whoops";
import TwoFactorAuthentication from "./-components/2fa";
import Passkeys from "./-components/passkeys";
import Profile from "./-components/profile";

export const Route = createFileRoute("/(app)/profile/")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();
    useEffect(() => {
      queryErrorResetBoundary.reset();
    }, [queryErrorResetBoundary]);
    const retry = () => {
      router.invalidate();
    };
    return <Whoops error={error} retry={retry} />;
  },
});

function RouteComponent() {
  return (
    <div className="mt-4 grid w-full place-items-center p-2">
      <Tabs className="w-full max-w-2xl" defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <UserIcon className="size-4" />
            <span className="hidden sm:block">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="passkeys">
            <KeyIcon className="size-4" />
            <span className="hidden sm:block">Passkeys</span>
          </TabsTrigger>
          <TabsTrigger value="2fa">
            <ShieldCheckIcon className="size-4" />
            <span className="hidden sm:block">2FA</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Profile />
        </TabsContent>
        <TabsContent value="passkeys">
          <Passkeys />
        </TabsContent>
        <TabsContent value="2fa">
          <TwoFactorAuthentication />
        </TabsContent>
      </Tabs>
    </div>
  );
}
