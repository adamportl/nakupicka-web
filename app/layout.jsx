import Script from "next/script";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dm-sans",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata = {
  title: "NÁKUPIČKA | Přehled nákupů",
  description: "Přehled nákupů, sdílení v rodině a jednoduché vyúčtování.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/app-icon.png",
    apple: "/images/app-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="cs"
      data-lang="cs"
      data-theme="dark"
      className={`${dmSans.variable} ${bricolageGrotesque.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#ff2d55" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#140a12" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" href="/images/app-icon.png" />
        <link rel="shortcut icon" type="image/png" href="/images/app-icon.png" />
        <link rel="apple-touch-icon" href="/images/app-icon.png" />
        <link rel="stylesheet" href="/styles.css" />
        <Script src="/preferences-boot.js" strategy="beforeInteractive" />
        <Script src="/oauth-return-to-app.js" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
