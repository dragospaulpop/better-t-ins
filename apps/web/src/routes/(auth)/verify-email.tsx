import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AppTitle from "@/components/app-title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthErrorMessage } from "@/lib/auth-error";
import {
  useSendVerificationEmail,
  useSession,
  useSignOut,
} from "@/lib/auth-hooks";
import { ensureSessionData } from "@/lib/auth-utils";

const EMAIL_VERIFICATION_RESEND_INTERVAL = 30;
const SECOND = 1000;

export const Route = createFileRoute("/(auth)/verify-email")({
  beforeLoad: async ({ context }) => {
    const sessionData = await ensureSessionData(context);
    const isLoggedIn = sessionData?.user;
    const isVerified = sessionData?.user.emailVerified;

    if (!isLoggedIn) {
      redirect({
        to: "/login",
        replace: true,
        throw: true,
      });
    }

    if (isVerified) {
      redirect({
        to: "/dashboard",
        replace: true,
        throw: true,
      });
    }

    return { session: sessionData?.session, user: sessionData?.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(
    undefined
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { data: session } = useSession();
  const { mutate: sendVerificationEmail } = useSendVerificationEmail();
  const { mutate: signOut } = useSignOut();
  const router = useRouter();

  const handleSendVerificatonEmail = () => {
    if (!session?.user.email) {
      toast.error("Email not found");
      return;
    }
    sendVerificationEmail(
      {
        email: session?.user.email,
        callbackURL: `${window.location.origin}/dashboard`,
      },
      {
        onSuccess: () => {
          setTimeLeft(EMAIL_VERIFICATION_RESEND_INTERVAL);
          toast.success("Verification email sent");
        },
        onError: (error) => {
          toast.error(getAuthErrorMessage(error));
        },
      }
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((time) => time - 1);
    }, SECOND);

    setIntervalId(interval);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(intervalId);
    }
  }, [timeLeft, intervalId]);
  return (
    <div className="grid h-full min-h-0 place-items-center p-2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <AppTitle />

        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardAction>
              <Button
                onClick={() => {
                  clearInterval(intervalId);
                  setIntervalId(undefined);
                  setTimeLeft(0);
                  signOut(
                    {},
                    {
                      onSuccess: () => {
                        router.invalidate();
                      },
                    }
                  );
                }}
                variant="ghost"
              >
                <ArrowLeftIcon className="size-4" />
                Logout
              </Button>
            </CardAction>
            <CardTitle>Verify Email</CardTitle>

            <CardDescription>Your email is not verified.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please check your email{" "}
              <span className="font-bold">{session?.user.email}</span> for a
              verification link or press the button below to resend the
              verification email.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={timeLeft > 0}
              onClick={handleSendVerificatonEmail}
            >
              Resend Verification Email {timeLeft > 0 ? `(${timeLeft}s)` : ""}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
