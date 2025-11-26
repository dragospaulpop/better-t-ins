import type { Ancestors } from "@better-t-ins/api/lib/get-ancestors";
import { Link } from "@tanstack/react-router";
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

interface BreadcrumbNavProps {
  id?: string;
  ancestors?: Ancestors;
}

export function BreadcrumbNav({ ancestors }: BreadcrumbNavProps) {
  const lastTwoAncestors = ancestors?.slice(-2);
  const menuAncestors = ancestors?.slice(0, -2);

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
        {ancestors && menuAncestors?.length ? (
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
        {ancestors && lastTwoAncestors?.length ? (
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
