'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, MapPin, Phone, Mail, Store, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border text-muted-foreground mt-auto">
      {/* Newsletter Banner */}
      <div className="border-b border-border py-6 sm:py-8 bg-gradient-to-r from-background via-primary/5 to-background">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                Join the Sneaker Club
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Subscribe to get early access to exclusive drops, restocks, and weekly edits.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  {subscribed ? 'Joined!' : 'Subscribe'}
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {subscribed && (
                <p className="mt-2 text-xs text-primary font-medium animate-pulse">
                  Welcome to Zarwinto! Check your inbox for 10% off your first order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Columns */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-black tracking-tighter text-foreground">
              ZARW<span className="text-primary">INTO</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zarwinto is a state-of-the-art premium footwear marketplace offering elite performance shoes, luxury craft sneakers, and all-weather boots.
            </p>
            <a
              href="https://www.instagram.com/zarwinto?igsh=MWl0MzIzOHkwaDVzbg=="
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary hover:bg-primary/20 hover:text-foreground rounded-lg transition-colors"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-widest uppercase mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/shop?category=sneakers" className="hover:text-foreground transition-colors">Sneakers</Link>
              </li>
              <li>
                <Link href="/shop?category=casual" className="hover:text-foreground transition-colors">Casual Shoes</Link>
              </li>
              <li>
                <Link href="/shop?category=boots" className="hover:text-foreground transition-colors">Boots</Link>
              </li>
              <li>
                <Link href="/shop?category=formal" className="hover:text-foreground transition-colors">Formal Shoes</Link>
              </li>
              <li>
                <Link href="/shop?category=sandals" className="hover:text-foreground transition-colors">Sandals</Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-widest uppercase mb-4">
              Customer Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">Shipping Information</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">FAQs</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">Size Guide</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-widest uppercase mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5 items-start">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Block - 2 Sharda Launchpad - Sharda University, Greater Noida - UP, India</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+917982369183" className="hover:text-foreground transition-colors">+91 79823 69183</a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:zarwinto12@gmail.com" className="hover:text-foreground transition-colors">zarwinto12@gmail.com</a>
              </li>
              <li className="flex gap-2.5 items-center">
                <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="https://wa.me/917982369183" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">+91 79823 69183 (WhatsApp)</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Banner */}
        <div className="border-t border-border mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <p>© {new Date().getFullYear()} Zarwinto Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/open-store" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold transition-colors">
              <Store className="h-4 w-4" />
              Open Your Store
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
