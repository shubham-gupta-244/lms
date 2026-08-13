import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPath",
  description: "Learn skills that actually pay off.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
