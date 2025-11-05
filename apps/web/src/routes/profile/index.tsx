import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckCircleIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import ShowBackupCodes from "@/routes/login/-components/show-backup-codes";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    const canAccess = session.data?.user.emailVerified;
    if (!canAccess) {
      redirect({
        to: "/login",
        replace: true,
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
    <div className="grid place-items-start p-2">
      <Card className="mx-auto w-full sm:max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Item>
            <ItemMedia>
              <Avatar className="size-16">
                <AvatarImage
                  className="grayscale"
                  src={session.data?.user.image ?? undefined}
                />

                <AvatarFallback>
                  {session.data?.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{session.data?.user.name}</ItemTitle>
              <ItemDescription>
                <span className="font-medium leading-none">
                  {session.data?.user.email}
                </span>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Tooltip>
                <TooltipTrigger asChild>
                  {session.data?.user.emailVerified ? (
                    <CheckCircleIcon className="size-8 text-success" />
                  ) : (
                    <XIcon className="size-8 text-destructive" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {session.data?.user.emailVerified
                    ? "Email verified"
                    : "Email not verified"}
                </TooltipContent>
              </Tooltip>
            </ItemActions>
          </Item>

          {session.data?.user.twoFactorEnabled ? <ShowBackupCodes /> : null}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Field
            className="w-full flex-wrap justify-center"
            orientation="horizontal"
          >
            {session.data?.user.twoFactorEnabled ? (
              <Button variant="destructive">Disable 2FA</Button>
            ) : (
              <Button
                onClick={() => {
                  navigate({
                    to: "/profile/enable-two-factor",
                  });
                }}
              >
                Enable 2FA
              </Button>
            )}

            {session.data?.user && (
              <Button
                onClick={async () => {
                  await authClient.deleteUser({
                    callbackURL: `${window.location.origin}/goodbye`,
                    fetchOptions: {
                      onSuccess: () => {
                        toast.success(
                          "Account deletion process started. Check your email for a verification link."
                        );
                      },
                      onError: (deleteUserError) => {
                        toast.error(
                          deleteUserError.error.message ||
                            deleteUserError.error.statusText
                        );
                        window.location.reload();
                      },
                    },
                  });
                }}
                variant="destructive"
              >
                Delete Account
              </Button>
            )}
            {session.data?.user && (
              <Button
                onClick={() => {
                  navigate({
                    to: "/profile/change-password",
                  });
                }}
                variant="outline"
              >
                Change Password
              </Button>
            )}
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
