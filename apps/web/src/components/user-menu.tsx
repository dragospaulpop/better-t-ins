import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ShieldCheckIcon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSession, useSignOut } from "@/lib/auth-hooks";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, isPending } = useSession();
  const { mutate: signOut, isPending: isSignOutPending } = useSignOut();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {user.role === "admin" && <ShieldCheckIcon className="size-4" />}
          {user.role === "user" && <UserIcon className="size-4" />}
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card p-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="my-2">
          <Button
            className="w-full"
            onClick={() => {
              navigate({
                to: "/profile",
              });
            }}
            variant="ghost"
          >
            {user.email}
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            className="w-full text-destructive"
            disabled={isSignOutPending}
            onClick={() => {
              signOut(
                {},
                {
                  onSuccess: () => {
                    router.invalidate();
                  },
                }
              );
            }}
            variant="ghost"
          >
            <LoadingSwap isLoading={isSignOutPending}>Sign Out</LoadingSwap>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
