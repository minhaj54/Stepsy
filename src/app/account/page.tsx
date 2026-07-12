import React, { Suspense } from 'react';
import AccountContent from './AccountContent';

export const metadata = {
  title: "Your Account - Stepzy Marketplace",
  description: "Manage your profile details, address book, active orders and footwear wishlist."
};

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Loading Profile...</span>
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
