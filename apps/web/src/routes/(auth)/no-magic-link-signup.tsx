import { createFileRoute, Link } from "@tanstack/react-router";
import AppTitle from "@/components/app-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(auth)/no-magic-link-signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid h-full min-h-0 place-items-center p-2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <AppTitle />

        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Sign up with magic link disabled</CardTitle>

            <CardDescription>
              Sign up with magic link is disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please create an account with the email and password option first.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <Link to="/login">Sign up with email and password</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
