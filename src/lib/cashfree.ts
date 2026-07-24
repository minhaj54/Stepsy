/**
 * Cashfree Payments API Utility
 * 
 * Cashfree API Documentation: https://www.cashfree.com/docs/api-reference/overview
 * 
 * Environment Variables Required:
 * - CASHFREE_APP_ID: Your Cashfree App ID
 * - CASHFREE_SECRET_KEY: Your Cashfree Secret Key
 * - CASHFREE_WEBHOOK_SECRET: Webhook verification secret
 * 
 * For sandbox/testing: Use sandbox credentials from Cashfree dashboard
 * For production: Use production credentials
 */

const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

if (!APP_ID || !SECRET_KEY) {
  console.warn('[Cashfree] Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY. Payment features will not work.');
}

/**
 * Get Cashfree API headers with authentication
 */
export function getCashfreeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01',
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
  }
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
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=success`,
          notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/cashfree/webhook`,
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

    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      console.error('[Cashfree] Create order failed:', data);
      return {
        success: false,
        error: data.message || data.error_message || 'Failed to create Cashfree order',
      };
    }

    return {
      success: true,
      orderId: data.data.order_id,
      paymentSessionId: data.data.payment_session_id,
      orderToken: data.data.order_token,
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

    if (!response.ok || data.status !== 'OK') {
      return {
        success: false,
        error: data.message || data.error_message || 'Failed to fetch order',
      };
    }

    return {
      success: true,
      order: data.data,
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
export function verifyCashfreeWebhook(
  payload: string,
  signature: string
): boolean {
  if (!SECRET_KEY) {
    console.warn('[Cashfree] Secret key not configured, skipping webhook verification');
    return true; // In development, allow through
  }

  // Cashfree uses HMAC-SHA256 for webhook verification with your Client Secret Key
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('base64');

  return signature === expectedSignature;
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
 * Get payment method display name
 */
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
