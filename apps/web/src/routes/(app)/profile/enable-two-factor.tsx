import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import EnableTwoFactorForm from "./-components/enable-two-factor-form";

export const Route = createFileRoute("/(app)/profile/enable-two-factor")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    if (session.data?.user.twoFactorEnabled) {
      redirect({
        to: "/profile",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="grid place-items-start p-2">
      <Card className="mx-auto w-full sm:max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <CardTitle className="flex-1 text-center">
              Enable Two-Factor Authentication
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EnableTwoFactorForm />
        </CardContent>
      </Card>
    </div>
  );
}
