import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Zarwinto - Premium Footwear & Sneaker Marketplace",
  description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
  openGraph: {
    title: "Zarwinto - Premium Footwear Marketplace",
    description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
    url: "https://zarwinto-footwear.vercel.app",
    siteName: "Zarwinto",
    type: "website"
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
            <CartProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main className="flex-grow flex flex-col">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
