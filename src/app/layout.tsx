import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/theme-provider";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { Header } from "./header";

const soraSans = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Matt Bolaños' personal website",
  metadataBase: new URL("https://mattbolanos.com"),
  openGraph: {
    description: "Matt Bolaños' personal website",
    siteName: "Matt Bolaños' personal website",
    title: "Matt Bolaños",
    type: "website",
    url: "https://mattbolanos.com",
  },
  title: "Matt Bolaños",
  twitter: {
    card: "summary_large_image",
    creator: "@mattabolanos",
    description: "Matt Bolaños' personal website",
    images: ["/opengraph-image.png"],
    title: "Matt Bolaños",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        soraSans.variable,
        geistMono.variable,
        "font-sans",
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="m-auto max-w-2xl leading-relaxed">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <main className="min-h-screen overscroll-y-contain px-5 pt-8 pb-8 md:px-6 md:pt-12">
            <Header />
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
