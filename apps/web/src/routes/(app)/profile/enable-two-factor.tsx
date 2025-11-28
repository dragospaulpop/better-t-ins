import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ensureSessionData } from "@/lib/auth-utils";
import EnableTwoFactorForm from "./-components/enable-two-factor-form";

export const Route = createFileRoute("/(app)/profile/enable-two-factor")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);
    if (sessionData?.user.twoFactorEnabled) {
      redirect({
        to: "/profile",
        throw: true,
      });
    }
    return { session: sessionData?.session, user: sessionData?.user };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="grid place-items-start p-2">
      <Card className="mx-auto w-full sm:max-w-2xl">
        <CardHeader>
          <CardAction>
            <Button
              onClick={() => {
                navigate({
                  to: "/profile",
                });
              }}
              size="sm"
              variant="ghost"
            >
              <ArrowLeftIcon />
              Back
            </Button>
          </CardAction>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enable two-factor authentication to add an extra layer of security
            to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnableTwoFactorForm />
        </CardContent>
      </Card>
    </div>
  );
}
