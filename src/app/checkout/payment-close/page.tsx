'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentClosePage() {
  useEffect(() => {
    // Try to close the window if it was opened as a popup
    if (window.opener) {
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="h-20 w-20 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Payment Complete</h1>
          <p className="text-muted-foreground">
            Your payment has been processed. You can close this window and return to the app.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/account?tab=orders';
            }
          }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          Return to Orders
        </button>
      </div>
    </div>
  );
}
