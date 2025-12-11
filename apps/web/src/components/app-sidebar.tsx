import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { FolderNode } from "@tud-box/api/lib/folders/folder-tree";
import {
  AlertCircleIcon,
  Clock,
  FolderOpen,
  Home,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-hooks";
import { trpc } from "@/lib/trpc";
import AppTitle from "./app-title";
import FileExplorer from "./file-explorer";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const mainItems = [
  { title: "Files", url: "/files", icon: FolderOpen },
  { title: "Dashboard", url: "/dashboard", icon: Home },
];

const adminItems = [
  { title: "Teams", url: "/admin/teams", icon: Users },
  { title: "Permissions", url: "/admin/permissions", icon: Shield },
  { title: "Activity", url: "/admin/activity", icon: Clock },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const userItems = [
  { title: "Activity", url: "/activity", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user } = useSession();

  const {
    data: rootFolderTree,
    isLoading: isLoadingRootFolderTree,
    isError: isErrorRootFolderTree,
    error: errorRootFolderTree,
  } = useQuery(trpc.folder.getRootFolderTree.queryOptions());

  const isAdmin = user?.role === "admin";
  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-3 py-2">
          <AppTitle open={open} size="small" />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      // activeClassName="bg-accent text-accent-foreground font-medium"
                      className="hover:bg-accent/50"
                      to={item.url}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      // activeClassName="bg-accent text-accent-foreground font-medium"
                      className="hover:bg-accent/50"
                      to={item.url}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="flex items-center justify-between gap-2">
            <span>Explorer</span>
            {isLoadingRootFolderTree && <Spinner />}
            {isErrorRootFolderTree && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircleIcon className="size-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent className="bg-muted text-muted-foreground">
                  {errorRootFolderTree.message}
                </TooltipContent>
              </Tooltip>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-1 overflow-x-auto">
            <div className="min-w-max flex-1">
              <FileExplorer
                rootNode={
                  rootFolderTree ??
                  ({
                    id: null,
                    name: "Root",
                    depth: 0,
                    files: [],
                    children: [],
                  } satisfies FolderNode)
                }
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
