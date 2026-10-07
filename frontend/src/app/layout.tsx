import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "crave. — Good food, good mood",
  description: "Find your new favourite meal. Freshly made food, delivered with love.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><Header />{children}</Providers></body></html>;
}
