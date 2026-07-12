import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stepzy - Premium Footwear & Sneaker Marketplace",
  description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
  openGraph: {
    title: "Stepzy - Premium Footwear Marketplace",
    description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
    url: "https://stepzy-footwear.vercel.app",
    siteName: "Stepzy",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
