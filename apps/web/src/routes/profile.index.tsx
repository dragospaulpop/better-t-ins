import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();

  return (
    <div className="p-2">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar className="size-16">
              <AvatarImage src={session.data?.user.image ?? undefined} />
              <AvatarFallback>
                {session.data?.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-center font-medium text-sm">
                {session.data?.user.name}
              </p>
              <p className="flex items-center justify-center gap-2 text-center text-muted-foreground text-sm">
                <span className="font-medium leading-none">
                  {session.data?.user.email}
                </span>
                {session.data?.user.emailVerified ? (
                  <CheckIcon className="size-3 text-green-500" />
                ) : (
                  <XIcon className="size-3 self-end text-red-500" />
                )}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {session.data?.user.twoFactorEnabled ? (
            <Button variant="destructive">
              Disable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              onClick={() => {
                navigate({
                  to: "/profile/enable-two-factor",
                });
              }}
            >
              Enable Two-Factor Authentication
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
