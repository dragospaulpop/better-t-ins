import { Link } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

export default function Whoops() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="text-destructive" variant="default">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Whoops</EmptyTitle>
          <EmptyDescription>
            An error occured. Please try again later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button variant="outline">
              <Link to="..">Go back</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
