import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LogOutIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSession, useSignOut } from "@/lib/auth-hooks";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";
import { SidebarMenuButton } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu({
  variant,
}: {
  variant: "sidebar" | "header";
}) {
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
        {variant === "header" ? (
          <Button variant="outline">
            {user.role === "admin" && <ShieldCheckIcon className="size-4" />}
            {user.role === "user" && <UserIcon className="size-4" />}
            {user.name}
          </Button>
        ) : (
          <SidebarMenuButton
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage alt={user.name} src={user.image ?? undefined} />
              <AvatarFallback className="rounded-lg">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            {user.role === "admin" && <ShieldCheckIcon className="size-4" />}
            {user.role === "user" && <UserIcon className="size-4" />}
          </SidebarMenuButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage alt={user.name} src={user.image ?? undefined} />
              <AvatarFallback className="rounded-lg">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="my-2"
          onClick={() => {
            navigate({
              to: "/profile",
            });
          }}
        >
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
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
          variant="destructive"
        >
          <LogOutIcon className="size-4" />
          <LoadingSwap isLoading={isSignOutPending}>Sign Out</LoadingSwap>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
