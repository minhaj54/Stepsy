// Supabase Edge Function: send-admin-notification
// Triggered by a Database Webhook on INSERT into `public.orders`.
// Sends a detailed admin email alert via Resend with full order and product details.

// Deno runtime types
// @ts-nocheck

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Zarwinto Orders <onboarding@resend.dev>";
const TO_ADDRESS = "minhajraza51694@gmail.com";

// Supabase project details
const SUPABASE_URL = "https://wcwacoewwfywqgxmskms.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjd2Fjb2V3d2Z5d3FneG1za21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTI5MTUsImVyY8I6MjA5NjY4ODkxNX0.B5Vc_DsdfM8PhgW8BzKFrhkhR-kIfEOOj-DJHDrQ114";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE" | string;
  table: string;
  record: Record<string, unknown>;
  schema: string;
}

function formatCurrency(value: unknown): string {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  try {
    return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dateStr;
  }
}

function getShippingAddress(addr: any): string {
  if (!addr) return "N/A";
  if (typeof addr === "string") {
    try { addr = JSON.parse(addr); } catch { return addr; }
  }
  const parts = [
    addr.name,
    addr.line1 ?? addr.address_line1,
    addr.line2 ?? addr.address_line2,
    addr.city,
    addr.state,
    addr.pincode ?? addr.postal_code,
    addr.country,
    addr.phone ? `Phone: ${addr.phone}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "N/A";
}

// Retry helper for handling race condition between order insert and order_items insert
async function fetchWithRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result && result.data && result.data.length > 0) {
        return result;
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return { data: [], error: null };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch (_e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const record = payload.record ?? {};
  const orderId = record.id ?? "unknown";
  const totalAmount = record.total_amount ?? 0;

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Wait a moment for order_items to be inserted (handles race condition)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Fetch order items with retry logic
  const { data: orderItems, error: itemsError } = await fetchWithRetry(
    () => supabase
      .from('order_items')
      .select('id, quantity, price, product_title, product_image, size, color')
      .eq('order_id', orderId),
    3,
    1500
  );

  if (itemsError) {
    console.error("Error fetching order items:", JSON.stringify(itemsError));
  }

  // Fetch customer details from users table
  const userId = record.user_id;
  let customerName = "N/A";
  let customerEmail = "N/A";
  let customerPhone = "N/A";

  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    if (userData) {
      customerName = userData.full_name || "N/A";
      customerEmail = userData.email || "N/A";
      customerPhone = userData.phone || "N/A";
    }
  }

  // Get shipping address from order record
  const shippingAddress = getShippingAddress(record.shipping_address);
  const paymentMethod = record.payment_method ?? "N/A";
  const paymentStatus = record.payment_status ?? "pending";
  const orderStatus = record.status ?? "pending";
  const orderDate = formatDate(record.created_at as string);

  // Build order items HTML
  const items = orderItems ?? [];
  const itemsHtml = items.length > 0
    ? `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
        <thead>
          <tr style="background: #f4f4f5;">
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e4e4e7; color: #374151;">Product</th>
            <th style="padding: 10px 8px; text-align: center; border-bottom: 2px solid #e4e4e7; color: #374151;">Qty</th>
            <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #e4e4e7; color: #374151;">Price</th>
            <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #e4e4e7; color: #374151;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => {
            const name = item.product_title ?? "Unknown Product";
            const qty = item.quantity ?? 1;
            const price = item.price ?? 0;
            const total = qty * price;
            const image = item.product_image ?? "";
            const size = item.size ?? "";
            const color = item.color ?? "";
            return `
              <tr style="border-bottom: 1px solid #f4f4f5;">
                <td style="padding: 12px 8px; vertical-align: top;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${image ? `<img src="${image}" alt="${name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e4e4e7;" />` : ""}
                    <div>
                      <strong style="color: #111;">${name}</strong>
                      ${size ? `<br><span style="color: #71717a; font-size: 11px;">Size: ${size}</span>` : ""}
                      ${color ? `<span style="color: #71717a; font-size: 11px;"> | Color: ${color}</span>` : ""}
                    </div>
                  </div>
                </td>
                <td style="padding: 12px 8px; text-align: center; vertical-align: middle; color: #374151;">${qty}</td>
                <td style="padding: 12px 8px; text-align: right; vertical-align: middle; color: #374151;">${formatCurrency(price)}</td>
                <td style="padding: 12px 8px; text-align: right; vertical-align: middle; font-weight: 600; color: #111;">${formatCurrency(total)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `
    : `<p style="color: #71717a; font-style: italic;">No items found in order.</p>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 24px; border-bottom: 2px solid #6366f1;">
        <h1 style="font-size: 24px; font-weight: 800; color: #6366f1; margin: 0;">ZARWINTO</h1>
        <p style="font-size: 14px; color: #71717a; margin: 4px 0 0;">New Order Received</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <p style="font-size: 12px; color: #71717a; margin: 0;">Order ID</p>
            <p style="font-size: 16px; font-weight: 700; color: #111; margin: 2px 0 0;">#${orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #71717a; margin: 0;">Order Date</p>
            <p style="font-size: 14px; font-weight: 600; color: #111; margin: 2px 0 0;">${orderDate}</p>
          </div>
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="background: #ffffff; border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 80px; text-align: center;">
            <p style="font-size: 11px; color: #71717a; margin: 0;">Status</p>
            <p style="font-size: 13px; font-weight: 600; color: #f59e0b; margin: 2px 0 0; text-transform: uppercase;">${orderStatus}</p>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 80px; text-align: center;">
            <p style="font-size: 11px; color: #71717a; margin: 0;">Payment</p>
            <p style="font-size: 13px; font-weight: 600; color: #10b981; margin: 2px 0 0; text-transform: uppercase;">${paymentStatus}</p>
          </div>
          <div style="background: #ffffff; border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 80px; text-align: center;">
            <p style="font-size: 11px; color: #71717a; margin: 0;">Method</p>
            <p style="font-size: 13px; font-weight: 600; color: #111; margin: 2px 0 0;">${paymentMethod}</p>
          </div>
        </div>
      </div>

      <h2 style="font-size: 16px; font-weight: 700; color: #111; margin: 0 0 12px;">📦 Order Items</h2>
      ${itemsHtml}

      <div style="background: #f9fafb; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #e4e4e7; margin-top: 8px;">
          <span style="font-size: 16px; font-weight: 700; color: #111;">Total</span>
          <span style="font-size: 18px; font-weight: 800; color: #6366f1;">${formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #6366f1; margin: 0 0 10px;">👤 Customer</h3>
          <p style="font-size: 13px; color: #111; margin: 0 0 4px;"><strong>Name:</strong> ${customerName}</p>
          <p style="font-size: 13px; color: #111; margin: 0 0 4px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="font-size: 13px; color: #111; margin: 0;"><strong>Phone:</strong> ${customerPhone}</p>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #6366f1; margin: 0 0 10px;">📍 Shipping Address</h3>
          <p style="font-size: 13px; color: #111; margin: 0; line-height: 1.5;">${shippingAddress}</p>
        </div>
      </div>

      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e4e4e7; margin-top: 24px;">
        <p style="font-size: 12px; color: #a1a1aa; margin: 0;">This is an automated notification from Zarwinto</p>
        <p style="font-size: 11px; color: #d4d4d8; margin: 4px 0 0;">Please process this order within 24 hours</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        subject: `New Order #${orderId} - ${formatCurrency(totalAmount)}`,
        html,
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      return new Response(`Resend error: ${body}`, { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Failed to send email: ${String(err)}`, {
      status: 500,
    });
  }
});