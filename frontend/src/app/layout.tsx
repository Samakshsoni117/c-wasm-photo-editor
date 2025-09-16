import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // Import the Script component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "C++ Wasm Editor",
  description: "Image editor powered by C++ and WebAssembly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        suppressHydrationWarning={true} // Fixes the hydration error
      >
        {children}
        {/* This loads our Wasm glue code on every page */}
        <Script src="/effects.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}