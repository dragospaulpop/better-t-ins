import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
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
import { trpc } from "@/utils/trpc";

interface BreadcrumbNavProps {
  id?: string;
}

export function BreadcrumbNav({ id }: BreadcrumbNavProps) {
  const ancestors = useQuery(
    trpc.folder.getAncestors.queryOptions({ id: id || null })
  );

  const lastTwoAncestors = ancestors.data?.slice(-2);
  const menuAncestors = ancestors.data?.slice(0, -2);

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
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
            <BreadcrumbSeparator />
            {lastTwoAncestors.map((ancestor, index) => (
              <>
                <BreadcrumbItem key={ancestor.id}>
                  <BreadcrumbLink asChild>
                    <Link
                      params={{ parentId: ancestor.id.toString() }}
                      to="/files/{-$parentId}"
                    >
                      {ancestor.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < lastTwoAncestors.length - 1 && (
                  <BreadcrumbSeparator key={`separator-${ancestor.id}`} />
                )}
              </>
            ))}
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
