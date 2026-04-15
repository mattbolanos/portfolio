import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Providers } from "./providers";
import "./globals.css";
import { Footer } from "@/components/footer";

const SITE_NAME = "Matt Bolaños";
const SITE_DESCRIPTION = "Matt Bolaños' personal website";

function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  return value.startsWith("http") ? value : `https://${value}`;
}

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    description: SITE_DESCRIPTION,
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
    url: "/",
  },
  title: SITE_NAME,
  twitter: {
    card: "summary_large_image",
    creator: "@mattabolanos",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
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
                {children}
              </main>
              <Footer />
            </Providers>
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
