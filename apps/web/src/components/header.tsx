import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-hooks";
import { ModeToggle } from "./mode-toggle";
import StopImpersonating from "./stop-impersonating";
import UploadNotifications from "./upload-notifications";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6">
      <SidebarTrigger />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            disabled
            placeholder="Search files, folders, users..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {session?.session?.impersonatedBy && <StopImpersonating />}

        <UploadNotifications />

        <ModeToggle />

        <UserMenu />
      </div>
    </header>
  );
}
