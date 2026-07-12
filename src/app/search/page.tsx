import React, { Suspense } from 'react';
import SearchContent from './SearchContent';

export const metadata = {
  title: "Search Footwear - Stepzy",
  description: "Search for premium running sneakers, leather boots, loafers and comfort shoes."
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Searching Stepzy...</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
