declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeCheckoutResult {
    error?: {
      code: string;
      message: string;
    };
    redirect?: boolean;
    paymentDetails?: {
      paymentMessage: string;
      paymentStatus: string;
      paymentId: string;
      orderId: string;
      orderAmount: number;
      paymentTime: string;
      paymentMethod: string;
      paymentMethodType: string;
      paymentErrorCode: string;
      paymentErrorDescription: string;
      bankErrorCode: string;
      bankErrorDescription: string;
    };
  }

  export interface CashfreeInstance {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | HTMLElement;
      appearance?: {
        width?: string;
        height?: string;
      };
    }): Promise<CashfreeCheckoutResult>;
  }

  export interface LoadOptions {
    mode: 'sandbox' | 'production';
  }

  export function load(options: LoadOptions): Promise<CashfreeInstance | null>;
}
