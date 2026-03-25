import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

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
      suppressHydrationWarning={true}
    >
      <head>
        <meta content="mattbolanos" name="apple-mobile-web-app-title" />
      </head>
      <body className="leading-relaxed">
        <div className="m-auto max-w-2xl">
          <Providers>
            <main className="min-h-screen overscroll-y-contain p-6 pt-8 md:pt-12">
              <Header />
              {children}
            </main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
