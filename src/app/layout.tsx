import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";
import { Footer } from "@/components/footer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  title: "Matt Bolaños",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${sora.variable} ${geistMono.variable} antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <meta content="mattbolanos" name="apple-mobile-web-app-title" />
        {process.env.NODE_ENV === "development" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="m-auto max-w-3xl overscroll-y-contain leading-relaxed">
        <Providers>
          <main className="min-h-screen p-6 md:pt-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
