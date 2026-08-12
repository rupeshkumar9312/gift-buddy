import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GiftBuddy Admin",
  description: "Operator console for the GiftBuddy store.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jost.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
