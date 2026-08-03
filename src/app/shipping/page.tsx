import React from 'react';
import Link from 'next/link';
import { Truck, Package, Clock, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: 'Shipping Information | Delivery Times, Rates & Policies - Zarwinto',
  description: 'Learn about Zarwinto shipping policies, delivery times, shipping rates, tracking, and packaging guidelines for buyers and sellers.',
  keywords: ['shipping', 'delivery', 'shipping rates', 'tracking', 'courier', 'Shiprocket', 'Xpressbees', 'Zarwinto shipping'],
  openGraph: {
    title: 'Shipping Information | Delivery Times, Rates & Policies - Zarwinto',
    description: 'Learn about Zarwinto shipping policies, delivery times, shipping rates, tracking, and packaging guidelines.',
    url: 'https://zarwinto.com/shipping',
    siteName: 'Zarwinto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zarwinto.com/shipping',
  },
};

const shippingForBuyers = [
  {
    icon: Truck,
    title: 'Shipping Partners',
    description: 'We partner with trusted courier services including Shiprocket, Xpressbees, and other leading logistics providers to ensure reliable delivery across India.',
  },
  {
    icon: Clock,
    title: 'Delivery Time',
    description: 'Standard delivery takes 3-7 business days across India. Metro cities usually receive orders within 2-4 days. Remote areas may take up to 7 days.',
  },
  {
    icon: Package,
    title: 'Packaging',
    description: 'Every order is carefully packed in a sturdy shoe box with protective padding to ensure your footwear arrives in perfect condition.',
  },
  {
    icon: ShieldCheck,
    title: 'Tracking',
    description: 'Once shipped, you\'ll receive a tracking number via SMS and email. Track your order in real-time through your account or the courier\'s website.',
  },
];

const shippingForSellers = [
  {
    icon: Package,
    title: 'Packaging Guidelines',
    description: 'Each product has optimized packaging dimensions to minimize shipping costs. Sneakers use compact 20×12×8cm boxes (~0.5kg), slides use ultra-compact 16×10×6cm boxes (~0.25kg), and boots use sturdy 24-26×14-15×12-13cm boxes (~0.7-0.8kg). All packages include protective padding.',
  },
  {
    icon: MapPin,
    title: 'Pickup Address',
    description: 'Sellers must provide a valid pickup address in their store settings. Our logistics partners will schedule pickups based on your availability.',
  },
  {
    icon: Truck,
    title: 'Shipping Integration',
    description: 'Zarwinto integrates with Shiprocket for seamless order fulfillment. Shipping labels and AWB codes are auto-generated when orders are placed.',
  },
  {
    icon: ShieldCheck,
    title: 'Seller Responsibilities',
    description: 'Sellers are responsible for order fulfillment within 2 business days. Delayed shipments may affect your store rating and customer satisfaction.',
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-12 sm:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Truck className="h-4 w-4" />
            Shipping Information
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-6">
            How We <span className="text-primary">Ship</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fast, reliable, and tracked delivery across India. Everything you need to know about shipping on Zarwinto.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
        {/* For Buyers */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 sm:mb-6 lg:mb-8">
            For Buyers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {shippingForBuyers.map((item, i) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-border bg-card p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For Sellers */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 sm:mb-6 lg:mb-8">
            For Sellers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {shippingForSellers.map((item, i) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-border bg-card p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Rates Info */}
        <section className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-primary/10 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 text-center">
            Shipping Rates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <p className="text-2xl font-black text-foreground">₹49</p>
              <p className="text-sm text-muted-foreground mt-1">Orders below ₹999</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-black text-primary">FREE</p>
              <p className="text-sm text-muted-foreground mt-1">Orders above ₹999</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-black text-foreground">3-7 Days</p>
              <p className="text-sm text-muted-foreground mt-1">Standard Delivery</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4 max-w-2xl mx-auto">
            We use per-product optimized packaging to minimize dimensional weight and keep shipping costs low.
            Sneakers: 20×12×8cm (~0.5kg), Slides: 16×10×6cm (~0.25kg), Boots: 24-26×14-15×12-13cm (~0.7-0.8kg).
            Surface shipping is preferred for cost efficiency.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-primary/10 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">Need Help?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
            Our support team is happy to help with shipping queries, tracking issues, or delivery concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <a
              href="mailto:zarwinto12@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
            <a
              href="https://wa.me/917982369183"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
