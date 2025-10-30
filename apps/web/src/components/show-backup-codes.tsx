import { useQuery } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, EyeIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";
import Loader from "./loader";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const INVALIDATE_QUERY_TIMEOUT = 5000;
const COPIED_TIMEOUT = 2000;

export default function ShowBackupCodes() {
  const [copySuccess, setCopySuccess] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    ...trpc.profile.getBackupCodes.queryOptions(),
    enabled: false,
    retry: false,
  });
  return (
    <Item>
      <ItemContent>
        <ItemTitle>Backup Codes</ItemTitle>
        <ItemDescription>
          {isLoading ? <Loader element="span" /> : null}

          {data?.backupCodes && !isLoading && !isError ? (
            <div className="grid grid-cols-5 gap-2">
              {data.backupCodes.map((code: string) => (
                <Badge className="w-full text-center" key={code}>
                  {code}
                </Badge>
              ))}
            </div>
          ) : null}
          {!data?.backupCodes || data?.backupCodes.length === 0 ? (
            <span className="font-medium leading-none">
              Click the button to view backup codes
            </span>
          ) : null}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {!data?.backupCodes || data?.backupCodes.length === 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  refetch();
                  setTimeout(() => {
                    queryClient.setQueryData(
                      trpc.profile.getBackupCodes.queryOptions().queryKey,
                      {
                        backupCodes: [],
                      }
                    );
                  }, INVALIDATE_QUERY_TIMEOUT);
                }}
                size="icon"
                variant="ghost"
              >
                <EyeIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View backup codes</TooltipContent>
          </Tooltip>
        ) : null}
        {data?.backupCodes && data?.backupCodes.length > 0 ? (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(data?.backupCodes.join(",") ?? "");
              toast.success("Backup codes copied to clipboard");
              setCopySuccess(true);
              setTimeout(() => {
                setCopySuccess(false);
              }, COPIED_TIMEOUT);
            }}
            size="icon"
            variant="ghost"
          >
            {copySuccess ? (
              <CheckIcon className="size-4 text-success" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        ) : null}
      </ItemActions>
    </Item>
  );
}
