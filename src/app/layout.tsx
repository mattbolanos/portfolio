import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme/provider";

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
      </head>
      <body className="m-auto max-w-2xl leading-relaxed">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <main className="min-h-screen p-8 pt-4 md:pt-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
