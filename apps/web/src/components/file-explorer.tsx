import { useNavigate, useParams } from "@tanstack/react-router";
import type { FolderNode } from "@tud-box/api/lib/folders/folder-tree";
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "./ui/sidebar";

function FolderNodeItem({ node }: { node: FolderNode }) {
  const { parentId } = useParams({ strict: false });
  const navigate = useNavigate();
  const isActive = parentId === String(node.id);
  const hasChildren = node.children.length > 0 || node.files.length > 0;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className=""
          isActive={isActive}
          onClick={() =>
            navigate({
              to: "/files/{-$parentId}",
              params: { parentId: String(node.id) },
            })
          }
        >
          <ChevronRightIcon className="size-4 shrink-0 opacity-0" />
          {isActive ? (
            <FolderOpenIcon className="size-4 shrink-0" />
          ) : (
            <FolderIcon className="size-4 shrink-0" />
          )}
          <span className="whitespace-nowrap">{node.name} leaf</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="[&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={isActive}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive}>
            <ChevronRightIcon className="size-4 transition-transform duration-200" />
            <CustomNavButton folderId={String(node.id)}>
              {isActive ? (
                <FolderOpenIcon className="size-4 shrink-0" />
              ) : (
                <FolderIcon className="size-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">{node.name}</span>
            </CustomNavButton>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children.map((child) => (
              <FolderNodeItem key={child.id} node={child} />
            ))}
            {node.files.map((file) => (
              <SidebarMenuItem key={file.fileId}>
                <SidebarMenuButton className="cursor-default data-[active=true]:bg-transparent">
                  <ChevronRightIcon className="size-4 shrink-0 opacity-0" />
                  <FileIcon className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">{file.fileName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

export default function FileExplorer({ rootNode }: { rootNode: FolderNode }) {
  const { parentId } = useParams({ strict: false });
  const isRootActive = !parentId;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible
          className="[&[data-state=open]>button>svg:first-child]:rotate-90"
          defaultOpen
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isRootActive}>
              <ChevronRightIcon className="size-4 transition-transform duration-200" />
              <CustomNavButton folderId={undefined}>
                {isRootActive ? (
                  <FolderOpenIcon className="size-4" />
                ) : (
                  <FolderIcon className="size-4" />
                )}
                <span>{rootNode.name}</span>
              </CustomNavButton>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {rootNode.children.map((item) => (
                <FolderNodeItem key={item.id} node={item} />
              ))}
              {rootNode.files.map((file) => (
                <SidebarMenuItem key={file.fileId}>
                  <SidebarMenuButton className="cursor-default data-[active=true]:bg-transparent">
                    <ChevronRightIcon className="size-4 shrink-0 opacity-0" />
                    <FileIcon className="size-4 shrink-0" />
                    <span className="whitespace-nowrap">{file.fileName}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function CustomNavButton({
  folderId,
  children,
}: {
  folderId: string | undefined;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: forgive me
    // biome-ignore lint/a11y/useSemanticElements: forgive me
    <div
      className="flex w-full flex-1 items-center justify-start gap-2"
      onClick={(e) => {
        e.stopPropagation();
        navigate({ to: "/files/{-$parentId}", params: { parentId: folderId } });
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
