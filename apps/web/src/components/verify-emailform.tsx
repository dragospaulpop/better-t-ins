import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const EMAIL_VERIFICATION_RESEND_INTERVAL = 30;
const SECOND = 1000;

export default function VerifyEmailForm({
  onSwitchToSignIn,
  email,
}: {
  onSwitchToSignIn: () => void;
  email: string;
}) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(
    undefined
  );
  const [timeLeft, setTimeLeft] = useState<number>(
    EMAIL_VERIFICATION_RESEND_INTERVAL
  );

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

  const sendEmailVerification = async () => {
    await authClient.sendVerificationEmail(
      {
        email,
        callbackURL: `${window.location.origin}/dashboard`,
      },
      {
        onSuccess: () => {
          setTimeLeft(EMAIL_VERIFICATION_RESEND_INTERVAL);
          toast.success("Verification email sent");
        },
        onError: (error) => {
          toast.error(
            error.error.message || "Failed to send verification email"
          );
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              clearInterval(intervalId);
              setIntervalId(undefined);
              setTimeLeft(0);
              onSwitchToSignIn();
            }}
            variant="ghost"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <CardTitle>Verify Email</CardTitle>
        </div>
        <CardDescription>Your email is not verified.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Please check your email <span className="font-bold">{email}</span> for
          a verification link or press the button below to resend the
          verification email.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={timeLeft > 0}
          onClick={sendEmailVerification}
        >
          Resend Verification Email {timeLeft > 0 ? `(${timeLeft}s)` : ""}
        </Button>
      </CardFooter>
    </Card>
  );
}
