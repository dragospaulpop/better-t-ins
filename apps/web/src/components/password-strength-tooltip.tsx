import { InfoIcon } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function PasswordStrengthTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="size-4" />
      </TooltipTrigger>
      <TooltipContent className="bg-muted text-muted-foreground">
        <div className="flex max-w-sm flex-col gap-2">
          <Item size="sm">
            <ItemContent>
              <ItemTitle className="text-destructive">Weak Password</ItemTitle>
              <ItemDescription>
                Between 8 and 12 characters long, 1 uppercase letter, 1
                lowercase letter, 1 number, and 1 special character
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle className="text-warning">Medium Password</ItemTitle>
              <ItemDescription>
                Between 12 and 16 characters long, 2 uppercase letters, 2
                lowercase letters, 2 numbers, and 2 special characters
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle className="text-success">Strong Password</ItemTitle>
              <ItemDescription>
                More than 16 characters long, 3 uppercase letters, 3 lowercase
                letters, 3 numbers, and 3 special characters
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
