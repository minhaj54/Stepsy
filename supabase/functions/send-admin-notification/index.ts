// Supabase Edge Function: send-admin-notification
// Triggered by a Database Webhook on INSERT into `public.orders`.
// Sends an admin email alert via Resend using their free testing domain.

// Deno runtime types
// @ts-nocheck

const RESEND_API_URL = "https://api.resend.com/emails";
// Resend's free testing sender (no domain verification required).
const FROM_ADDRESS = "Shop Alert <onboarding@resend.dev>";
// The email you used to register your Resend account (onboarding@resend.dev only delivers here).
const TO_ADDRESS = "minhajraza51694@gmail.com";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE" | string;
  table: string;
  record: Record<string, unknown>;
  schema: string;
}

function formatCurrency(value: unknown): string {
  const num = typeof value === "number"
    ? value
    : Number(value ?? 0);
  if (Number.isNaN(num)) return String(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

Deno.serve(async (req: Request) => {
  // Only accept POST from the Database Webhook.
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
  // Real column is `total_amount`; also tolerate `total_price` if renamed.
  const totalAmount = record.total_amount ?? record.total_price ?? 0;

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #111; margin: 0 0 16px;">
        🚨 New Order Alert!
      </h1>
      <p style="font-size: 15px; color: #333; margin: 0 0 12px;">
        A new order has just been placed on your store.
      </p>
      <div style="background: #f7f7f8; border-radius: 10px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #555;">
          <strong style="color: #111;">Order ID:</strong>
          <span style="font-weight: 700;">${orderId}</span>
        </p>
        <p style="margin: 0; font-size: 14px; color: #555;">
          <strong style="color: #111;">Total Amount:</strong>
          <span style="font-weight: 700;">${formatCurrency(totalAmount)}</span>
        </p>
      </div>
      <p style="font-size: 13px; color: #999; margin: 0;">
        This is an automated admin notification.
      </p>
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
        subject: `🚨 New Order Alert! Roll #${orderId}`,
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
