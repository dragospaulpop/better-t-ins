import { pretty, toPlainText } from "@react-email/components";
import { render as renderEmail } from "@react-email/render";
import type { ReactNode } from "react";

export default async function render(email: ReactNode) {
  const html = await renderEmail(email);
  const prettyHtml = await pretty(html);
  const plainText = toPlainText(html);
  return { html: prettyHtml, text: plainText };
}
