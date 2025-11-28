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
import DisableTwoFactorForm from "./-components/disable-two-factor-form";

export const Route = createFileRoute("/(app)/profile/disable-two-factor")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);

    if (!sessionData?.user.twoFactorEnabled) {
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
          <CardTitle>Disable Two-Factor Authentication</CardTitle>
          <CardDescription>
            We highly recommend NOT disabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DisableTwoFactorForm />
        </CardContent>
      </Card>
    </div>
  );
}
