'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
  category: string;
}

const FAQS: Faq[] = [
  {
    category: 'Orders',
    question: 'How do I place an order?',
    answer:
      'Browse the shop, add your favorite pairs to the cart, and proceed to checkout. You can sign in with your phone number via OTP and complete payment securely. Once confirmed, your order is sent to the seller store for processing.',
  },
  {
    category: 'Orders',
    question: 'Can I modify or cancel my order after placing it?',
    answer:
      'Orders can be cancelled within 30 minutes of placement if they have not yet been shipped. Go to your account → Orders and select "Cancel". For modifications, please contact support as soon as possible.',
  },
  {
    category: 'Shipping',
    question: 'What are the shipping times and costs?',
    answer:
      'Standard shipping takes 3–7 business days across India. Orders above ₹999 ship free; otherwise a flat ₹49 fee applies. You will receive tracking details by email once your order leaves the warehouse.',
  },
  {
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer:
      'Currently we ship within India only. International shipping is on our roadmap — subscribe to the newsletter to be the first to know when we expand.',
  },
  {
    category: 'Returns',
    question: 'What is your return and exchange policy?',
    answer:
      'We offer a 7-day easy return and exchange window for unused items in original packaging. Start a return from your account or the Returns page. Refunds are processed within 5–7 business days to your original payment method.',
  },
  {
    category: 'Returns',
    question: 'My item arrived damaged. What should I do?',
    answer:
      'We are sorry about that! Email support@zarwinto.com with photos of the damage within 48 hours of delivery, and we will arrange a free replacement or full refund.',
  },
  {
    category: 'Sizing',
    question: 'How do I find the right size?',
    answer:
      'Each product page lists size options (UK/US/UK). If you are between sizes, we recommend going a half size up for sneakers and a full size up for boots. Check our Size Guide for brand-specific notes.',
  },
  {
    category: 'Payments',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept UPI, all major credit/debit cards, net banking, and popular wallets. All transactions are encrypted and processed through our secure payment gateway.',
  },
  {
    category: 'Account',
    question: 'How do I create an account?',
    answer:
      'Click "Account" in the header and sign up using your phone number. We will send a one-time password (OTP) to verify your number — no passwords to remember.',
  },
  {
    category: 'Stores',
    question: 'Can I sell my own shoes on Zarwinto?',
    answer:
      'Yes! Independent sellers and brands can open a store through our "Open Your Store" program. You get a dedicated storefront, inventory tools, and order management.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
      const matchesQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm">Everything you need to know about ordering, shipping, and selling on Zarwinto.</p>
        </div>

        {/* Search + category filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full bg-card/60 border border-border rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ accordion */}
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            No questions match your search. Try a different keyword or{' '}
            <a href="mailto:support@zarwinto.com" className="text-primary hover:underline">
              contact support
            </a>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={faq.question}
                  className="glass-card rounded-2xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                      <span className="text-foreground font-semibold text-sm sm:text-base">{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact CTA */}
        <div className="glass-card rounded-2xl p-8 text-center border border-border">
          <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Our support team is happy to help you with anything.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@zarwinto.com"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Email Support
            </a>
            <Link
              href="/returns"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted border border-border text-zinc-200 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              Returns & Exchanges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
