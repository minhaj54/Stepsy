/**
 * Shiprocket API Integration
 * Documentation: https://apidocs.shiprocket.in/
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketCredentials {
  email: string;
  password: string;
  apiKey: string;
}

interface ShippingRateRequest {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number; // in kg
  length: number; // in cm
  breadth: number; // in cm
  height: number; // in cm
  declaredValue: number;
  cod?: number;
}

interface ShippingRateResponse {
  status: number;
  data: {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    estimated_delivery_days: string;
    is_surface: boolean;
    is_air: boolean;
    cod_charges: number;
    other_charges: number;
    freight_charges: number;
    total_charges: number;
  }[];
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: string;
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface ShiprocketOrderResponse {
  status: number;
  message: string;
  order_id: number;
  channel_order_id: string;
  channel: string;
  shipment_id: number;
  order_status: string;
  status_code: number;
  onboarding_completed: boolean;
  redx_status?: string;
  redx_tracking_id?: string;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

interface ShiprocketOrder {
  id: number;
  channel_order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  shipping_address: string;
  order_date: string;
  order_status: string;
  status_code: number;
  total: number;
  payment_method: string;
  awb_code?: string;
  courier_name?: string;
  shipment_id?: number;
}

interface ShiprocketOrdersResponse {
  status: number;
  data: {
    orders: ShiprocketOrder[];
    total: number;
    page: number;
    per_page: number;
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get authentication token from Shiprocket
 */
export async function getShiprocketToken(): Promise<string> {
  const email = process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL;
  const password = process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD;
  const apiKey = process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured. Please set NEXT_PUBLIC_SHIPROCKET_EMAIL and NEXT_PUBLIC_SHIPROCKET_PASSWORD in .env.local');
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Shiprocket] Attempting auth with email:', email);
    console.log('[Shiprocket] Password length:', password.length);
    console.log('[Shiprocket] API key present:', !!apiKey);
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const payload: any = {
    email,
    password,
  };
  if (apiKey) {
    payload.api_key = apiKey;
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Shiprocket auth failed: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.token) {
    throw new Error('Shiprocket auth response missing token');
  }

  // Cache token for 23 hours (tokens expire after 24 hours)
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + (23 * 60 * 60 * 1000),
  };

  return data.token;
}

/**
 * Calculate shipping rates for a given route
 */
export async function getShippingRates(request: ShippingRateRequest): Promise<ShippingRateResponse['data']> {
  const token = await getShiprocketToken();

  const queryParams = new URLSearchParams({
    pickup_postcode: request.pickupPincode,
    delivery_postcode: request.deliveryPincode,
    weight: request.weight.toString(),
    cod: (request.cod || 0).toString(),
  });

  if (request.length) queryParams.append('length', request.length.toString());
  if (request.breadth) queryParams.append('breadth', request.breadth.toString());
  if (request.height) queryParams.append('height', request.height.toString());
  if (request.declaredValue) queryParams.append('declared_value', request.declaredValue.toString());

  const response = await fetch(`${SHIPROCKET_BASE_URL}/courier/serviceability/?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get shipping rates: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  const companies = data?.data?.available_courier_companies || [];

  return companies.map((item: any) => ({
    courier_company_id: item.courier_company_id || item.courier_id || 0,
    courier_name: item.courier_name || 'Courier',
    rate: Number(item.rate || item.total_charges || 0),
    estimated_delivery_days: item.estimated_delivery_days || item.etd || '3-5 days',
    is_surface: !!item.is_surface,
    is_air: !item.is_surface,
    cod_charges: Number(item.cod_charges || 0),
    other_charges: Number(item.other_charges || 0),
    freight_charges: Number(item.freight_charges || item.rate || 0),
    total_charges: Number(item.total_charges || item.rate || 0),
  }));
}

/**
 * Create an order in Shiprocket
 */
export async function createShiprocketOrder(
  order: ShiprocketOrderRequest,
  pickupLocation?: string
): Promise<ShiprocketOrderResponse> {
  const defaultPickupLocation = process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || 'Home';
  const location = pickupLocation || order.pickup_location || defaultPickupLocation;
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...order,
      pickup_location: location,
    }),
  });

  if (!response.ok) {
    let errorBody: any = {};
    try { errorBody = await response.json(); } catch {}
    console.error('Shiprocket order creation error body:', JSON.stringify(errorBody, null, 2));
    throw new Error(`Failed to create Shiprocket order: ${errorBody.message || errorBody.error || response.statusText}`);
  }

  let data: any;
  try { data = await response.json(); } catch {
    throw new Error('Failed to parse Shiprocket order creation response');
  }

  // Shiprocket may return status 200 with an errors array or error message
  const hasError = data.status === 0 ||
    (data.errors && Object.keys(data.errors).length > 0) ||
    (data.message && /error|failed|invalid|wrong/i.test(data.message));

  if (hasError) {
    const errMsg = data.message || JSON.stringify(data.errors) || 'Unknown error';
    console.error('Shiprocket order creation failed body:', JSON.stringify(data, null, 2));
    throw new Error(`Shiprocket order creation failed: ${errMsg}`);
  }

  // Validate that we got the expected success fields
  if (!data.order_id && !data.shipment_id) {
    console.error('Shiprocket order creation unexpected response:', JSON.stringify(data, null, 2));
    throw new Error('Shiprocket order creation failed: Invalid response from server');
  }

  return data as ShiprocketOrderResponse;
}

/**
 * Get all orders from Shiprocket
 */
export async function getShiprocketOrders(page: number = 1, perPage: number = 50): Promise<ShiprocketOrdersResponse> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch Shiprocket orders: ${error.message || response.statusText}`);
  }

  const data: ShiprocketOrdersResponse = await response.json();

  if (data.status !== 1) {
    throw new Error('Shiprocket returned an error while fetching orders');
  }

  return data;
}

/**
 * Get a single order by Shiprocket order ID
 */
export async function getShiprocketOrderById(shiprocketOrderId: number): Promise<ShiprocketOrder> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/show/${shiprocketOrderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch Shiprocket order: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 1) {
    throw new Error('Shiprocket returned an error while fetching order details');
  }

  return data.order_details;
}

/**
 * Generate shipping label/invoice for an order
 */
export async function generateShippingLabel(shipmentId: number): Promise<Blob> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/print/invoice?shipment_id=${shipmentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate shipping label: ${error.message || response.statusText}`);
  }

  return response.blob();
}

/**
 * Generate AWB (Air Waybill) for an order
 */
export async function generateAWB(shipmentId: number): Promise<{ awb_code: string; courier_company_id: number }> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: [shipmentId],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate AWB: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 1) {
    throw new Error('Shiprocket returned an error while generating AWB');
  }

  return {
    awb_code: data.awb_data[0].awb_code,
    courier_company_id: data.awb_data[0].courier_company_id,
  };
}

/**
 * Cancel an order in Shiprocket
 */
export async function cancelShiprocketOrder(shipmentId: number): Promise<void> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: [shipmentId],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to cancel Shiprocket order: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 1) {
    throw new Error('Shiprocket returned an error while cancelling order');
  }
}

/**
 * Get pickup locations configured in Shiprocket
 */
export async function getPickupLocations(): Promise<{ id: number; name: string; address: string; pincode: string }[]> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch pickup locations: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 1) {
    throw new Error('Shiprocket returned an error while fetching pickup locations');
  }

  return data.data;
}

/**
 * Clear cached token (useful for testing or token refresh)
 */
export function clearShiprocketTokenCache(): void {
  cachedToken = null;
}
