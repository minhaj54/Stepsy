/**
 * Cashfree Payments API Utility
 * 
 * Cashfree API Documentation: https://www.cashfree.com/docs/api-reference/overview
 * 
 * Environment Variables Required:
 * - CASHFREE_APP_ID: Your Cashfree App ID
 * - CASHFREE_SECRET_KEY: Your Cashfree Secret Key (also used for webhook verification)
 * 
 * For sandbox/testing: Use sandbox credentials from Cashfree dashboard
 * For production: Use production credentials
 */

const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!APP_ID || !SECRET_KEY) {
  console.warn('[Cashfree] Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY. Payment features will not work.');
}

/**
 * Get Cashfree API headers with authentication
 */
export function getCashfreeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-version': '2026-01-01',
    'x-client-id': APP_ID || '',
    'x-client-secret': SECRET_KEY || '',
  };
}

/**
 * Create a new order on Cashfree
 * @param orderId - Your internal order ID
 * @param amount - Order amount in INR
 * @param customerDetails - Customer information
 * @returns Cashfree order response with payment session ID
 */
export async function createCashfreeOrder(
  orderId: string,
  amount: number,
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  },
  baseUrl?: string
): Promise<{
  success: boolean;
  orderId?: string;
  paymentSessionId?: string;
  orderToken?: string;
  error?: string;
}> {
  if (!APP_ID || !SECRET_KEY) {
    return { success: false, error: 'Cashfree credentials not configured' };
  }

  // Use provided baseUrl, or construct from env/request headers
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: getCashfreeHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerDetails.phone.replace(/\D/g, '').slice(-10),
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
        },
        order_meta: {
          return_url: `${siteUrl}/checkout?status=success`,
          notify_url: `${siteUrl}/api/cashfree/webhook`,
        },
        payment_methods: {
          upi: { enabled: true },
          card: { enabled: true },
          netbanking: { enabled: true },
          wallet: { enabled: true },
          paylater: { enabled: false },
          emi: { enabled: false },
        },
      }),
    });

    const data: any = await response.json();

    // Cashfree returns order directly at top level on success
    // Check for order_id or payment_session_id to confirm success
    const cashfreeOrderId = data.order_id || data.cf_order_id;
    const paymentSessionId = data.payment_session_id;

    console.log('[Cashfree] Create order response:', JSON.stringify(data, null, 2));
    console.log('[Cashfree] Payment session ID:', paymentSessionId);

    if (!response.ok || !cashfreeOrderId || !paymentSessionId) {
      console.error('[Cashfree] Create order failed:', data);
      return {
        success: false,
        error: data.message || data.error_message || 'Failed to create Cashfree order',
      };
    }

    return {
      success: true,
      orderId: cashfreeOrderId,
      paymentSessionId: paymentSessionId,
      orderToken: data.order_token,
    };
  } catch (error) {
    console.error('[Cashfree] Create order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while creating order',
    };
  }
}

/**
 * Create a payment link for an order
 * This is an alternative to hosted checkout when payment session ID is invalid
 */
export async function createCashfreePaymentLink(
  orderId: string,
  amount: number,
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  },
  returnUrl: string
): Promise<{
  success: boolean;
  paymentLink?: string;
  error?: string;
}> {
  if (!APP_ID || !SECRET_KEY) {
    return { success: false, error: 'Cashfree credentials not configured' };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const webhookUrl = `${siteUrl}/api/cashfree/webhook`;
    
    const response = await fetch(`${CASHFREE_BASE_URL}/links`, {
      method: 'POST',
      headers: getCashfreeHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        link_amount: amount,
        link_currency: 'INR',
        link_purpose: 'payment',
        customer_details: {
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
        },
        return_url: returnUrl,
        notify_url: webhookUrl,
        payment_methods: {
          upi: { enabled: true },
          card: { enabled: true },
          netbanking: { enabled: true },
          wallet: { enabled: true },
        },
      }),
    });

    const data: any = await response.json();

    console.log('[Cashfree] Create payment link response:', JSON.stringify(data, null, 2));

    if (!response.ok || !data.link_url) {
      return {
        success: false,
        error: data.message || data.error_message || 'Failed to create payment link',
      };
    }

    return {
      success: true,
      paymentLink: data.link_url,
    };
  } catch (error) {
    console.error('[Cashfree] Create payment link error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while creating payment link',
    };
  }
}

/**
 * Get order details from Cashfree
 */
export async function getCashfreeOrder(orderId: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  if (!APP_ID || !SECRET_KEY) {
    return { success: false, error: 'Cashfree credentials not configured' };
  }

  try {
    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getCashfreeHeaders(),
    });

    const data = await response.json();

    // Cashfree returns order directly at top level on success
    if (!response.ok || !data.order_id) {
      return {
        success: false,
        error: data.message || data.error_message || 'Failed to fetch order',
      };
    }

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error('[Cashfree] Get order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Verify Cashfree webhook signature
 * Cashfree signs webhook events using your Payment Gateway Client Secret Key.
 * The signature is sent in the x-webhook-signature header.
 */
export async function verifyCashfreeWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  if (!SECRET_KEY) {
    console.error('[Cashfree] Secret key not configured, rejecting webhook');
    return false;
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const messageData = encoder.encode(payload);

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey => {
    return crypto.subtle.sign('HMAC', cryptoKey, messageData);
  }).then(signatureBuffer => {
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    return signature === hashBase64;
  }).catch((error) => {
    console.error('[Cashfree] Webhook verification failed:', error);
    return false;
  });
}

/**
 * Map Cashfree payment status to our internal status
 */
export function mapCashfreeStatus(cashfreeStatus: string): {
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'cod_pending';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
} {
  switch (cashfreeStatus.toUpperCase()) {
    case 'PAID':
    case 'SUCCESS':
      return { paymentStatus: 'paid', orderStatus: 'processing' };
    case 'PENDING':
    case 'PROCESSING':
      return { paymentStatus: 'unpaid', orderStatus: 'pending' };
    case 'FAILED':
    case 'EXPIRED':
      return { paymentStatus: 'unpaid', orderStatus: 'pending' };
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return { paymentStatus: 'refunded', orderStatus: 'processing' };
    case 'CANCELLED':
      return { paymentStatus: 'unpaid', orderStatus: 'cancelled' };
    case 'USER_DROPPED':
      return { paymentStatus: 'unpaid', orderStatus: 'pending' };
    default:
      return { paymentStatus: 'unpaid', orderStatus: 'pending' };
  }
}

/**
 * Resolve a Cashfree status into our internal payment/order status.
 * Returns null for non-final states (PENDING / PROCESSING / unknown) so callers
 * DON'T downgrade an already-paid order while Cashfree is still confirming the
 * payment asynchronously. Only definitive outcomes are returned.
 */
export function resolveCashfreePaymentStatus(raw?: string): {
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'cod_pending';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
} | null {
  const s = (raw || 'PENDING').toUpperCase();
  switch (s) {
    case 'PAID':
    case 'SUCCESS':
      return { paymentStatus: 'paid', orderStatus: 'processing' };
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return { paymentStatus: 'refunded', orderStatus: 'processing' };
    case 'FAILED':
    case 'EXPIRED':
      return { paymentStatus: 'unpaid', orderStatus: 'pending' };
    case 'CANCELLED':
    case 'USER_DROPPED':
      return { paymentStatus: 'unpaid', orderStatus: 'cancelled' };
    default:
      // PENDING / PROCESSING / unknown — not a final outcome; caller should skip.
      return null;
  }
}
export function getPaymentMethodDisplay(method: string): string {
  switch (method.toUpperCase()) {
    case 'UPI':
      return 'UPI';
    case 'CARD':
      return 'Credit/Debit Card';
    case 'NETBANKING':
      return 'Net Banking';
    case 'WALLET':
      return 'Wallet';
    case 'PAYLATER':
      return 'Pay Later';
    case 'EMI':
      return 'EMI';
    default:
      return method || 'Online Payment';
  }
}

/**
 * Check if running in production mode
 */
export function isCashfreeProduction(): boolean {
  return IS_PRODUCTION;
}
