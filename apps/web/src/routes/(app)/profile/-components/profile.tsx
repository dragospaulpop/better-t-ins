import { useNavigate } from "@tanstack/react-router";
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
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { useDeleteUser, useSession } from "@/lib/auth-hooks";

export default function Profile() {
  const { user } = useSession();
  const { mutate: deleteUser, isPending: isDeleteUserPending } =
    useDeleteUser();
  const navigate = useNavigate();

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Item>
          <ItemMedia>
            <Avatar className="size-16">
              <AvatarImage
                className="grayscale"
                src={user?.image ?? undefined}
              />

              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{user?.name}</ItemTitle>
            <ItemDescription>
              <span className="font-medium leading-none">{user?.email}</span>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Tooltip>
              <TooltipTrigger asChild>
                {user?.emailVerified ? (
                  <CheckCircleIcon className="size-8 text-success" />
                ) : (
                  <XIcon className="size-8 text-destructive" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {user?.emailVerified ? "Email verified" : "Email not verified"}
              </TooltipContent>
            </Tooltip>
          </ItemActions>
        </Item>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Field
          className="w-full flex-wrap justify-center"
          orientation="horizontal"
        >
          {user && (
            <Button
              onClick={() => {
                deleteUser(
                  {
                    callbackURL: `${window.location.origin}/goodbye`,
                  },
                  {
                    onSuccess: () => {
                      toast.success(
                        "Account deletion process started. Check your email for a verification link."
                      );
                    },
                    onError: (error) => {
                      toast.error(getAuthErrorMessage(error));
                    },
                  }
                );
              }}
              variant="destructive"
            >
              <LoadingSwap isLoading={isDeleteUserPending}>
                Delete Account
              </LoadingSwap>
            </Button>
          )}
          {user && (
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
  );
}
