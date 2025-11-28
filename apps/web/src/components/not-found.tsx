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

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon />
        </EmptyMedia>
        <EmptyTitle>Not Found</EmptyTitle>
        <EmptyDescription>
          The page you are looking for does not exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="..">Go back</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
