import React from 'react';

function ShimmerCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="aspect-square w-full bg-background/40 animate-pulse" />
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="h-3 w-1/3 bg-secondary rounded animate-pulse" />
        <div className="h-4 w-full bg-secondary rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
        <div className="mt-auto pt-2 flex justify-between">
          <div className="h-4 w-1/4 bg-secondary rounded animate-pulse" />
          <div className="h-8 w-8 bg-secondary rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ShimmerBanner() {
  return (
    <div className="h-48 sm:h-64 md:h-80 lg:h-96 w-full bg-card animate-pulse" />
  );
}

function ShimmerIcon() {
  return (
    <div className="p-2.5 bg-primary/10 text-primary rounded-lg animate-pulse">
      <div className="h-6 w-6 bg-primary/20 rounded" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="w-full flex flex-col">
      {/* Shimmer Banner */}
      <ShimmerBanner />

      {/* Shimmer Selling Points */}
      <section className="bg-card py-8 border-y border-border">
        <div className="mx-auto max-w-2xl px-2 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <ShimmerIcon />
              <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Shimmer Categories */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center mb-4 sm:mb-8 space-y-1">
          <div className="h-8 w-48 bg-secondary rounded animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-secondary rounded animate-pulse mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[45%] sm:w-[25%] lg:w-[16%] aspect-[3/4] bg-secondary/30 rounded-md sm:rounded-lg animate-pulse" />
          ))}
        </div>
      </section>

      {/* Shimmer Products */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-secondary rounded animate-pulse" />
            <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-secondary rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
