'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, MapPin, Phone, Mail, Globe, MessageSquare, Hash, Store } from 'lucide-react';

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
    <footer className="w-full bg-zinc-950 border-t border-white/[0.04] text-zinc-400 mt-auto">
      {/* Newsletter Banner */}
      <div className="border-b border-white/[0.04] py-10 bg-gradient-to-r from-zinc-950 via-primary/5 to-zinc-950">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
                Join the Sneaker Club
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Subscribe to get early access to exclusive drops, restocks, and weekly edits.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-white/[0.03] text-white border border-white/[0.08] hover:border-white/[0.15] focus:border-primary focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
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
                  Welcome to Whishkhu! Check your inbox for 10% off your first order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Columns */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-black tracking-tighter text-white">
              STEP<span className="text-primary">ZY</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Whishkhu is a state-of-the-art premium footwear marketplace offering elite performance shoes, luxury craft sneakers, and all-weather boots.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/[0.03] hover:bg-primary/20 hover:text-white rounded-lg transition-colors" aria-label="Instagram">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/[0.03] hover:bg-primary/20 hover:text-white rounded-lg transition-colors" aria-label="Twitter">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/[0.03] hover:bg-primary/20 hover:text-white rounded-lg transition-colors" aria-label="Facebook">
                <Hash className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/shop?category=sneakers" className="hover:text-white transition-colors">Sneakers</Link>
              </li>
              <li>
                <Link href="/shop?category=casual" className="hover:text-white transition-colors">Casual Shoes</Link>
              </li>
              <li>
                <Link href="/shop?category=boots" className="hover:text-white transition-colors">Boots</Link>
              </li>
              <li>
                <Link href="/shop?category=formal" className="hover:text-white transition-colors">Formal Shoes</Link>
              </li>
              <li>
                <Link href="/shop?category=sandals" className="hover:text-white transition-colors">Sandals</Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4">
              Customer Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Shipping Information</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Size Guide</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5 items-start">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>100 Sneaker Plaza, Hype District, NY 10001, USA</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:support@whishkhu.com" className="hover:text-white transition-colors">support@whishkhu.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Banner */}
        <div className="border-t border-white/[0.04] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Whishkhu Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/open-store" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold transition-colors">
              <Store className="h-4 w-4" />
              Open Your Store
            </Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
