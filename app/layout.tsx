import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from '@vercel/speed-insights/next';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Nexus Ed | AI-Powered Online Course Creation Platform",
    template: "%s | Nexus Ed",
  },
  description: "Create engaging online courses with Nexus Ed's AI-powered platform. Design, manage, and share personalized learning experiences effortlessly.",
  keywords: [
    "AI course creation",
    "online learning platform",
    "LMS for educators",
    "e-learning software",
    "course builder",
    "Nexus Ed",
    "online education",
    "personalized learning",
  ],
  authors: [{ name: "EduAI Solutions OÜ", url: "https://www.nexus-ed.com" }],
  creator: "EduAI Solutions OÜ",
  publisher: "EduAI Solutions OÜ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: defaultUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Nexus Ed",
    title: "Nexus Ed | AI-Powered Online Course Creation Platform",
    description: "Create engaging online courses with Nexus Ed's AI-powered platform. Design, manage, and share personalized learning experiences effortlessly.",
    images: [
      {
        url: `${defaultUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Nexus Ed - AI-Powered Course Creation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NexusEd",
    creator: "@NexusEd",
    title: "Nexus Ed | AI-Powered Online Course Creation Platform",
    description: "Create engaging online courses with Nexus Ed's AI-powered platform. Design, manage, and share personalized learning experiences effortlessly.",
    images: [`${defaultUrl}/og-image.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
    // Add other verification codes (e.g., Bing) if needed
  },
};

// JSON-LD Structured Data for Organization and Website
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${defaultUrl}/#organization`,
      name: "EduAI Solutions OÜ",
      url: defaultUrl,
      logo: `${defaultUrl}/logo.png`,
      sameAs: [
        "https://twitter.com/NexusEd",
        "https://www.linkedin.com/company/nexus-ed",
        // Add other social profiles
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Your Street Address",
        addressLocality: "Tallinn",
        addressRegion: "Harju County",
        postalCode: "Your Postal Code",
        addressCountry: "EE",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@nexus-ed.com",
        // Add phone if applicable
      },
    },
    {
      "@type": "WebSite",
      "@id": `${defaultUrl}/#website`,
      url: defaultUrl,
      name: "Nexus Ed",
      description: "AI-powered platform for creating and managing online courses.",
      publisher: { "@id": `${defaultUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${defaultUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}