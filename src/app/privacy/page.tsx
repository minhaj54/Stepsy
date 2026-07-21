import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy - Zarwinto",
  description: "How Zarwinto collects, uses, and protects your personal information. Read our privacy policy to understand your data rights."
};

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — such as your name, email, phone number, shipping address, and payment details when you create an account, place an order, or contact support. We also collect limited technical data (device type, browser, and usage analytics) automatically through cookies to improve your experience.'
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to process and deliver orders, provide customer support, send order and account notifications, personalize your shopping experience, and improve our products and services. We do not sell your personal data to third parties.'
  },
  {
    title: '3. Payment & Security',
    body: 'Payments are processed by PCI-DSS compliant payment gateways. Zarwinto never stores your full card number or CVV on our servers. All sensitive data is encrypted in transit using industry-standard TLS.'
  },
  {
    title: '4. Cookies & Tracking',
    body: 'We use essential cookies to keep you signed in and functional cookies to remember your cart and preferences. Analytics cookies help us understand site performance. You can disable non-essential cookies in your browser settings, though some features may be limited.'
  },
  {
    title: '5. Sharing with Sellers & Partners',
    body: 'To fulfill your order, we share the minimum necessary details (name, address, items ordered) with the partner store that sells the product and with our logistics partners. These parties are bound to use the data solely for order fulfillment.'
  },
  {
    title: '6. Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time from your account settings or by contacting our support team. You can also opt out of marketing communications with one click.'
  },
  {
    title: '7. Data Retention',
    body: 'We retain your account and order information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements.'
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this privacy policy from time to time. Material changes will be communicated via email or a notice on our site. The "last updated" date reflects the latest revision.'
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-12 sm:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <ShieldCheck className="h-4 w-4" />
            Your Data, Protected
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We respect your privacy and are transparent about how we handle your information.
            This policy explains what we collect and why.
          </p>
          <p className="text-xs text-muted-foreground mt-4">Last updated: July 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto">
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-3">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-zinc-950 to-primary/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Questions about your data?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Our team is happy to help. Reach out and we'll get back to you promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:privacy@zarwinto.com"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Contact Privacy Team
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/returns"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted text-white border border-border px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Returns & Exchanges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
