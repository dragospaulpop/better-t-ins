import { Link } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

export default function RouterError({
  title,
  messages,
}: {
  title: string;
  messages: string[];
}) {
  return (
    <Card>
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="text-destructive" variant="default">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Whoops</EmptyTitle>
          <EmptyDescription>An error occured.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Alert className="text-left" variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              <ul>
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button variant="outline">
              <Link to="..">Go back</Link>
            </Button>
            <Button variant="outline">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </Card>
  );
}
