import React from 'react';
import Link from 'next/link';
import { Ruler, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: 'Size Guide | Shoe Size Chart & Measurement Tips - Zarwinto',
  description: 'Find your perfect fit with our comprehensive shoe size guide. Convert between US, UK, EU, and CM sizes for sneakers, boots, and casual shoes.',
  keywords: ['size guide', 'shoe size', 'size chart', 'footwear measurement', 'US size', 'UK size', 'EU size', 'CM size', 'how to measure feet'],
  openGraph: {
    title: 'Size Guide | Shoe Size Chart & Measurement Tips - Zarwinto',
    description: 'Find your perfect fit with our comprehensive shoe size guide. Convert between US, UK, EU, and CM sizes.',
    url: 'https://zarwinto.com/size-guide',
    siteName: 'Zarwinto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zarwinto.com/size-guide',
  },
};

const sizeChart = [
  { us: '6', uk: '5.5', eu: '38.5', cm: '24.1' },
  { us: '6.5', uk: '6', eu: '39', cm: '24.6' },
  { us: '7', uk: '6.5', eu: '40', cm: '25.1' },
  { us: '7.5', uk: '7', eu: '40.5', cm: '25.6' },
  { us: '8', uk: '7.5', eu: '41', cm: '26.0' },
  { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
  { us: '9', uk: '8.5', eu: '42.5', cm: '27.0' },
  { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
  { us: '10', uk: '9.5', eu: '44', cm: '28.0' },
  { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
  { us: '11', uk: '10.5', eu: '45', cm: '29.0' },
  { us: '11.5', uk: '11', eu: '45.5', cm: '29.5' },
  { us: '12', uk: '11.5', eu: '46', cm: '30.0' },
];

const howToMeasure = [
  {
    step: '1',
    title: 'Trace Your Foot',
    description: 'Place a piece of paper on a hard floor. Stand on the paper with your full weight and trace the outline of your foot.',
  },
  {
    step: '2',
    title: 'Measure Length',
    description: 'Measure the distance from the back of your heel to the tip of your longest toe. This is your foot length in cm.',
  },
  {
    step: '3',
    title: 'Find Your Size',
    description: 'Use the chart below to match your CM measurement to the corresponding US size. If between sizes, go up for a comfortable fit.',
  },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-12 sm:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Ruler className="h-4 w-4" />
            Size Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-6">
            Find Your <span className="text-primary">Perfect Fit</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Use our size chart to find the right fit. We recommend measuring your feet in CM for the most accurate sizing.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-5xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
        {/* How to Measure */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 sm:mb-6 lg:mb-8">
            How to Measure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {howToMeasure.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-card p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4 text-lg font-black">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Size Chart */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 sm:mb-6 lg:mb-8">
            Size Chart
          </h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/10 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary">US</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary">UK</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary">EU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary">CM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sizeChart.map((size, i) => (
                    <tr key={size.us} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                      <td className="px-4 py-3 font-semibold text-foreground">{size.us}</td>
                      <td className="px-4 py-3 text-muted-foreground">{size.uk}</td>
                      <td className="px-4 py-3 text-muted-foreground">{size.eu}</td>
                      <td className="px-4 py-3 text-muted-foreground">{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            * Sizes may vary slightly by brand and style. When in doubt, size up for a more comfortable fit.
          </p>
        </section>

        {/* Tips */}
        <section className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-primary/10 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 text-center">
            Pro Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Measure your feet at the end of the day when they are largest.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Wear the socks you typically use with your shoes when measuring.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">If between sizes, choose the larger size for sneakers and casual shoes.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Check the product description for brand-specific sizing notes.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-primary/10 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">Still Unsure?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
            Our support team can help you find the perfect size. Reach out and we'll take care of the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <a
              href="https://wa.me/917982369183"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <Ruler className="h-4 w-4" />
              WhatsApp Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
