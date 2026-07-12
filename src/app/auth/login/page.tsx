import React, { Suspense } from 'react';
import PhoneAuthForm from '../../../components/PhoneAuthForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PhoneAuthForm mode="login" />
    </Suspense>
  );
}
