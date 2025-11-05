import "dotenv/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import Tw from "../tw";

interface OTPEmailProps {
  verificationCode?: string;
  expiryTimeInMinutes?: number;
}

export default function OTPEmail({
  verificationCode,
  expiryTimeInMinutes,
}: OTPEmailProps) {
  const baseUrl = process.env.BASE_URL ?? "";
  const appName = process.env.APP_NAME ?? "";
  const companyName = process.env.COMPANY_NAME ?? "";
  const companyAddress = process.env.COMPANY_ADDRESS ?? "";
  const companyHomepage = process.env.COMPANY_HOMEPAGE ?? "";
  const privacyPolicyLink = process.env.PRIVACY_POLICY_LINK ?? "";

  return (
    <Html>
      <Head />
      <Body className="bg-white text-black">
        <Tw>
          <Preview>Email OTP</Preview>
          <Container className="mx-auto my-0 bg-white p-5">
            <Section className="bg-white">
              <Section className="flex items-center justify-center bg-muted px-0 py-5">
                <Img
                  alt={`${baseUrl}`}
                  height="45"
                  src={`${baseUrl}/logo.webp`}
                  width="auto"
                />
              </Section>
              <Section className="px-9 py-6">
                <Heading className="mb-3.5 font-bold text-2xl text-gray-900">
                  Login to your account using the following verification code
                </Heading>
                <Text className="mx-0 mt-6 mb-3.5 text-accent text-sm">
                  Please enter the following verification code to confirm your
                  login.
                </Text>
                <Section className="flex items-center justify-center">
                  <Text className="m-0 text-center font-bold text-accent text-sm">
                    Verification code
                  </Text>

                  <Text className="mx-0 my-2.5 text-center font-bold font-mono text-4xl text-primary tracking-widest">
                    {verificationCode}
                  </Text>
                  <Text className="m-0 text-center text-accent text-sm">
                    (This code is valid for {expiryTimeInMinutes} minutes)
                  </Text>
                </Section>
              </Section>
              <Hr />
              <Section className="px-9 py-6">
                <Text className="m-0 text-accent text-sm">
                  {appName} will never email you and ask you to disclose or
                  verify your password, credit card, or banking account number.
                </Text>
              </Section>
            </Section>
            <Text className="mx-0 my-6 px-5 py-0 text-accent text-sm">
              This message was produced and distributed by {companyName},
              {companyAddress}. © 2025, {companyName}. All rights reserved.{" "}
              {appName} is a registered trademark of{" "}
              <Link
                className="text-secondary text-sm underline"
                href={companyHomepage}
                target="_blank"
              >
                {companyName}
              </Link>
              . View our
              <Link
                className="text-secondary text-sm underline"
                href={privacyPolicyLink}
                target="_blank"
              >
                privacy policy
              </Link>
              .
            </Text>
          </Container>
        </Tw>
      </Body>
    </Html>
  );
}

OTPEmail.PreviewProps = {
  verificationCode: "596853",
  expiryTimeInMinutes: 3,
} satisfies OTPEmailProps;
