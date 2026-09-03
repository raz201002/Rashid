import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Gridwise Studio", description: "A BESS peak-shaving learning studio" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
