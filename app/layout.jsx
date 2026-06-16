import Script from "next/script";

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
    <html lang="cs" data-lang="cs" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#ff2d55" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#140a12" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" href="/images/app-icon.png" />
        <link rel="shortcut icon" type="image/png" href="/images/app-icon.png" />
        <link rel="apple-touch-icon" href="/images/app-icon.png" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap"
          rel="stylesheet"
        />
        <Script src="/preferences-boot.js" strategy="beforeInteractive" />
        <Script src="/oauth-return-to-app.js" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
