import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export const metadata = {
  title: "Terms of Service - Zarwinto",
  description: "The terms and conditions governing your use of the Zarwinto marketplace, including orders, accounts, and seller relationships."
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Zarwinto (the "Marketplace"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use the Marketplace.'
  },
  {
    title: '2. Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information and be at least 18 years old (or have parental consent) to create an account.'
  },
  {
    title: '3. Orders & Pricing',
    body: 'Product listings, prices, and availability are provided by partner stores and are subject to change without notice. We strive for accuracy but are not responsible for typographical or photographic errors. An order confirmation does not guarantee acceptance; a contract is formed once the seller dispatches your item.'
  },
  {
    title: '4. Payments & Taxes',
    body: 'All payments are processed securely through our compliant payment partners. You authorize us to charge the total order amount, including applicable shipping and taxes. Prices displayed are inclusive of applicable taxes unless stated otherwise.'
  },
  {
    title: '5. Marketplace & Sellers',
    body: 'Zarwinto is a multi-vendor marketplace. Each partner store is responsible for the products they list, including authenticity, quality, and fulfillment. Zarwinto facilitates the transaction but is not the manufacturer of the goods unless explicitly stated.'
  },
  {
    title: '6. Returns, Exchanges & Refunds',
    body: 'Returns and exchanges are governed by our Returns & Exchanges policy. Refunds are issued to your original payment method after the returned item passes inspection. Sale and customized items may have different eligibility.'
  },
  {
    title: '7. Intellectual Property',
    body: 'All trademarks, logos, product imagery, and content on the Marketplace are the property of Zarwinto or its partners and are protected by law. You may not reproduce, distribute, or create derivative works without prior written permission.'
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Zarwinto shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Marketplace. Our total liability is limited to the amount you paid for the relevant order.'
  },
  {
    title: '9. Prohibited Conduct',
    body: 'You agree not to misuse the Marketplace, attempt to breach its security, scrape data, infringe intellectual property, or engage in fraudulent activity. We may suspend or terminate accounts that violate these terms.'
  },
  {
    title: '10. Changes to Terms',
    body: 'We may revise these Terms of Service from time to time. Continued use of the Marketplace after changes are posted constitutes acceptance of the updated terms. The "last updated" date reflects the latest revision.'
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-8 sm:py-12 lg:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <FileText className="h-4 w-4" />
            The Fine Print, Made Clear
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4 sm:mb-6">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            These terms outline your rights and responsibilities when using the Zarwinto
            marketplace. Please read them carefully.
          </p>
          <p className="text-xs text-muted-foreground mt-4">Last updated: July 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-3xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-zinc-950 to-primary/10 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">Still have questions?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
            Our support team is here to help clarify anything about your orders or account.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <a
              href="mailto:support@zarwinto.com"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted text-foreground border border-border px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
