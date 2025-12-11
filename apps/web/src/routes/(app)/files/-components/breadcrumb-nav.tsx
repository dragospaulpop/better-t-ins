import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Ancestors } from "@tud-box/api/lib/folders/get-ancestors";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";

interface BreadcrumbNavProps {
  id?: string;
  currentFolderId?: string | null | undefined;
}

const selectAncestors = (ancestors: Ancestors) => ({
  lastTwoAncestors: ancestors.slice(-2),
  menuAncestors: ancestors.slice(0, -2),
});

export function BreadcrumbNav({ currentFolderId }: BreadcrumbNavProps) {
  const { data: { lastTwoAncestors = [], menuAncestors = [] } = {} } =
    useSuspenseQuery({
      ...trpc.folder.getAncestors.queryOptions({
        id: currentFolderId,
      }),
      select: selectAncestors,
    });

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link params={{ parentId: undefined }} to="/files/{-$parentId}">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {menuAncestors.length ? (
          <>
            <BreadcrumbSeparator key="separator-ellipsis" />
            <BreadcrumbItem key="item-ellipsis">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="size-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {menuAncestors?.map((ancestor) => (
                    <DropdownMenuItem key={ancestor.id}>
                      <Link
                        params={{ parentId: ancestor.id.toString() }}
                        to="/files/{-$parentId}"
                      >
                        {ancestor.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        ) : null}
        {lastTwoAncestors.length ? (
          <>
            <BreadcrumbSeparator key="separator-last-two" />
            {lastTwoAncestors.map((ancestor, index) => (
              <Fragment key={ancestor.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      params={{ parentId: ancestor.id.toString() }}
                      to="/files/{-$parentId}"
                    >
                      {ancestor.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < lastTwoAncestors.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
