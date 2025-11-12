export default function RecaptchaNotice() {
  return (
    <div className="text-center text-muted-foreground text-xs">
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        className="text-primary underline"
        href="https://policies.google.com/privacy"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        className="text-primary underline"
        href="https://policies.google.com/terms"
      >
        Terms of Service
      </a>{" "}
      apply.
    </div>
  );
}
