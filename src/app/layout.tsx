import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../components/Toast";
import { OrganizationSchema, WebSiteSchema } from "../components/JsonLd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavigationProgress from "../components/NavigationProgress";

export const metadata: Metadata = {
  title: "Zarwinto - Premium Footwear & Sneaker Marketplace",
  description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/svg+xml",
        url: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        url: "/favicon-96x96.png",
      },
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
  openGraph: {
    title: "Zarwinto - Premium Footwear Marketplace",
    description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
    url: "https://zarwinto.com",
    siteName: "Zarwinto",
    type: "website"
  },
  other: {
    "google-site-verification": "google13b395b9b31ac820"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>
                <Suspense fallback={null}>
                  <NavigationProgress />
                </Suspense>
                <OrganizationSchema />
                <WebSiteSchema />
                {/* Cashfree JS SDK */}
                <script
                  src="https://sdk.cashfree.com/js/v3/cashfree.js"
                  async
                />
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
                <main className="flex-grow flex flex-col">{children}</main>
                <Footer />
              </CartProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
