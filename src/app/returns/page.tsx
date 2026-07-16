import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowRight, CheckCircle2, Package, Clock, ShieldCheck, MessageCircle } from 'lucide-react';

export const metadata = {
  title: "Returns & Exchanges - Zarwinto",
  description: "Easy 30-day returns and exchanges on all Zarwinto footwear. Learn how to return or exchange your shoes with a free return label."
};

const steps = [
  {
    icon: Package,
    title: 'Start Your Request',
    description: 'Go to your account, open the order, and click “Return or Exchange” within 30 days of delivery.'
  },
  {
    icon: RefreshCw,
    title: 'Pick Return or Exchange',
    description: 'Choose a refund to your original payment method or exchange for a different size/color of the same shoe.'
  },
  {
    icon: ShieldCheck,
    title: 'Free Pickup or Drop-off',
    description: 'We email you a prepaid return label. Schedule a free pickup or drop the package at any partner center.'
  },
  {
    icon: Clock,
    title: 'Get Refunded or Reshipped',
    description: 'Refunds are processed within 5–7 business days of inspection. Exchanges ship out as soon as we receive your pair.'
  }
];

const policies = [
  'Items must be unworn, in original condition, and returned with the box and tags.',
  'Footwear can be tried on indoors on a clean surface to check the fit.',
  'Sale and final-clearance items are eligible for exchange only, not refund.',
  'Custom-made and personalized footwear cannot be returned unless defective.',
  'Defective or wrong items are replaced free of charge, no questions asked.'
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-12 sm:py-20 overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <RefreshCw className="h-4 w-4" />
            30-Day Happiness Guarantee
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Returns & <span className="text-primary">Exchanges</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Not the perfect fit? No worries. Every Zarwinto order comes with a hassle-free 30-day
            return or exchange window and a free return label.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto space-y-16">
        {/* How it works */}
        <section>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5"
              >
                <span className="absolute -top-3 left-5 text-xs font-black text-zinc-600">0{i + 1}</span>
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Policy list */}
        <section>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Return policy</h2>
          <ul className="space-y-3">
            {policies.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-zinc-900/30 p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/[0.06] bg-gradient-to-r from-primary/10 via-zinc-950 to-primary/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Need a hand?</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Our support team is happy to help with sizing, defects, or starting a return. Reach out
            and we'll take care of the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Go to My Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:support@zarwinto.com"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
