'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye, Search, Filter, Package, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, ExternalLink, CreditCard, XCircle, Receipt, Store } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { useToast } from '../../../components/Toast';

interface AdminOrdersClientProps {
  initialOrders: any[];
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const configured = isSupabaseConfigured();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const handleGenerateAWB = async (orderId: string, shipmentId: number) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch('/api/shiprocket/awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, orderId }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 1) {
        throw new Error(data.error || 'Failed to generate AWB');
      }
      
      // Update local orders state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, awb_code: data.data.awb_code, courier_name: `Courier ID: ${data.data.courier_company_id}` } : o))
      );
      addToast('AWB generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to generate AWB', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelShipment = async (orderId: string, shipmentId: number) => {
    if (!confirm('Are you sure you want to cancel the shipment in Shiprocket?')) return;
    setUpdatingId(orderId);
    try {
      const response = await fetch('/api/shiprocket/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, orderId }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 1) {
        throw new Error(data.error || 'Failed to cancel shipment');
      }
      
      // Update local orders state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, shiprocket_order_id: undefined, shipment_id: undefined, awb_code: undefined, courier_name: undefined } : o))
      );
      addToast('Shipment cancelled successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to cancel shipment', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !configured) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const limit = 20;
    const from = (nextPage - 1) * limit;
    const to = from + limit - 1;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, users(full_name, email, phone), stores(name, slug, logo_url), order_items(*, stores(name, slug, logo_url), products(title, price, sale_price, stores(name, slug, logo_url), product_images(image_url, sort_order)))')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data && data.length > 0) {
        const variantIds = new Set<string>();
        data.forEach((order: any) => {
          (order.order_items ?? []).forEach((item: any) => {
            if (item.variant_id) variantIds.add(item.variant_id);
          });
        });

        let variantsMap = new Map<string, { size: string; color: string }>();
        if (variantIds.size > 0) {
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id, size, color')
            .in('id', Array.from(variantIds));
          (variants ?? []).forEach((v: any) => {
            variantsMap.set(v.id, { size: v.size, color: v.color });
          });
        }

        data.forEach((order: any) => {
          (order.order_items ?? []).forEach((item: any) => {
            const variant = variantsMap.get(item.variant_id);
            if (variant) {
              item.variant_size = variant.size;
              item.variant_color = variant.color;
            }
          });
        });

        setOrders(prev => [...prev, ...(data as any[])]);
        setPage(nextPage);
      }

      if (!data || data.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more orders:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [configured, hasMore, isLoadingMore, page]);

  // Fetch order items separately if they're missing (for existing orders)
  const fetchOrderItems = async (orderId: string) => {
    if (!configured) return null;
    const supabase = createClient();
    const { data: items } = await supabase
      .from('order_items')
      .select('*, stores(name, slug, logo_url), products(title, price, sale_price, stores(name, slug, logo_url), product_images(image_url, sort_order))')
      .eq('order_id', orderId);
    return items;
  };

  // Handle expand - fetch items if missing
  const handleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    // Check if current order has items, if not fetch them
    const order = orders.find(o => o.id === orderId);
    if (order && (!order.order_items || order.order_items.length === 0)) {
      const items = await fetchOrderItems(orderId);
      if (items && items.length > 0) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_items: items } : o));
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  // Fetch order items for orders that are missing them
  const fetchedOrderIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!configured || orders.length === 0) return;

    const ordersMissingItems = orders.filter(o => {
      if (!o.order_items || o.order_items.length === 0) {
        if (fetchedOrderIds.current.has(o.id)) return false;
        return true;
      }
      return false;
    });

    if (ordersMissingItems.length === 0) return;

    const supabase = createClient();
    const fetchMissingItems = async () => {
      for (const order of ordersMissingItems) {
        fetchedOrderIds.current.add(order.id);

        const { data: items, error } = await supabase
          .from('order_items')
          .select('*, stores(name, slug, logo_url), products(title, price, sale_price, stores(name, slug, logo_url), product_images(image_url, sort_order))')
          .eq('order_id', order.id);

        if (error) continue;

        if (items && items.length > 0) {
          // Fetch variants for these items
          const variantIds = new Set<string>();
          items.forEach((item: any) => {
            if (item.variant_id) variantIds.add(item.variant_id);
          });

          if (variantIds.size > 0) {
            const { data: variants } = await supabase
              .from('product_variants')
              .select('id, size, color')
              .in('id', Array.from(variantIds));

            const variantsMap = new Map<string, { size: string; color: string }>();
            (variants ?? []).forEach((v: any) => {
              variantsMap.set(v.id, { size: v.size, color: v.color });
            });

            items.forEach((item: any) => {
              const variant = variantsMap.get(item.variant_id);
              if (variant) {
                item.variant_size = variant.size;
                item.variant_color = variant.color;
              }
            });
          }

          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, order_items: items } : o));
        }
      }
    };

    fetchMissingItems();
  }, [configured, JSON.stringify(orders.map(o => o.id))]);

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatuses = ['unpaid', 'paid', 'refunded', 'cod_pending'];

  const filteredOrders = orders.filter(order => {
    const users = order.users as { full_name: string; email: string } | null;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (users?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-muted-foreground border-zinc-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'paid': return 'bg-green-500/10 text-green-400';
      case 'unpaid': return 'bg-red-500/10 text-red-400';
      case 'refunded': return 'bg-yellow-500/10 text-yellow-400';
      case 'cod_pending': return 'bg-orange-500/10 text-orange-400';
      case 'success': return 'bg-green-500/10 text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400';
      case 'failed': return 'bg-red-500/10 text-red-400';
      case 'expired': return 'bg-red-500/10 text-red-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'user_dropped': return 'bg-zinc-500/10 text-muted-foreground';
      default: return 'bg-zinc-500/10 text-muted-foreground';
    }
  };

  // Safely build a printable invoice in a new window.
  // All dynamic values are HTML-escaped to prevent injection from
  // customer-entered data (names, addresses, product titles).
  const escapeHtml = (value: unknown): string => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const generateInvoice = (order: any) => {
    const users = (order.users as { full_name?: string; email?: string; phone?: string } | null) ?? null;
    const orderItems = (order.order_items as any[]) || [];
    const addr = (order.shipping_address as any) || {};
    const orderItemsForInvoice = (order.order_items as any[]) || [];
    const store =
      (order.stores as { name?: string; slug?: string } | null) ||
      (orderItemsForInvoice[0]?.stores as { name?: string; slug?: string } | null) ||
      (orderItemsForInvoice[0]?.products?.stores as { name?: string; slug?: string } | null) ||
      null;

    const customerName = users?.full_name || addr.full_name || addr.fullName || 'N/A';
    const customerEmail = users?.email || 'N/A';
    const customerPhone = addr.phone || users?.phone || 'N/A';
    const addressLine = [
      addr.address_line1 || addr.addressLine1,
      addr.city,
      addr.state,
      addr.pincode ? `- ${addr.pincode}` : ''
    ].filter(Boolean).join(', ') || 'N/A';

    const orderId = order.id ? String(order.id).slice(0, 8).toUpperCase() : 'N/A';
    const invoiceNo = `INV-${orderId}`;
    const invoiceDate = order.created_at
      ? new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : 'N/A';

    const rows = orderItems.map((item, i) => {
      const title = item.product_title || item.products?.title || 'Product';
      const size = item.size || item.variant_size || '-';
      const color = item.color || item.variant_color || '-';
      const qty = Number(item.quantity ?? 1);
      const price = Number(item.price ?? 0);
      const total = price * qty;
      return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">
            ${escapeHtml(title)}<br/>
            <span style="color:#6b7280;font-size:12px;">Size: ${escapeHtml(size)} • Color: ${escapeHtml(color)}</span>
          </td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₹${price.toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₹${total.toFixed(2)}</td>
        </tr>`;
    }).join('');

    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0
    );
    const grandTotal = Number(order.total_amount ?? subtotal);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(invoiceNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 32px; }
    .invoice { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #6366f1; }
    .meta { text-align: right; font-size: 13px; color: #374151; }
    .meta strong { display: block; font-size: 16px; color: #111827; }
    .parties { display: flex; gap: 24px; margin: 20px 0; }
    .party { flex: 1; font-size: 13px; color: #374151; }
    .party h4 { margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #f3f4f6; text-align: left; padding: 8px; border: 1px solid #e5e7eb; }
    tfoot td { padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; }
    .total-row td { font-size: 15px; background: #f9fafb; }
    .footer { margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    @media print { body { padding: 0; } .invoice { border: none; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="brand">ZAR<span>WINTO</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">Tax Invoice / Receipt</div>
      </div>
      <div class="meta">
        <strong>${escapeHtml(invoiceNo)}</strong>
        <div>Order #${escapeHtml(orderId)}</div>
        <div>${escapeHtml(invoiceDate)}</div>
        ${store?.name ? `<div style="margin-top:4px;">Store: <strong style="color:#4338ca;">${escapeHtml(store.name)}</strong></div>` : ''}
        <div style="margin-top:6px;"><span class="badge">${escapeHtml(order.status || 'N/A')}</span></div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h4>Bill To</h4>
        <div style="font-weight:600;color:#111827;">${escapeHtml(customerName)}</div>
        <div>${escapeHtml(customerEmail)}</div>
        <div>${escapeHtml(customerPhone)}</div>
      </div>
      <div class="party">
        <h4>Ship To</h4>
        <div style="font-weight:600;color:#111827;">${escapeHtml(customerName)}</div>
        <div>${escapeHtml(addressLine)}</div>
        <div>${escapeHtml(customerPhone)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Item</th>
          <th style="width:60px;text-align:center;">Qty</th>
          <th style="width:90px;text-align:right;">Price</th>
          <th style="width:90px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5" style="padding:8px;border:1px solid #e5e7eb;text-align:center;color:#6b7280;">No items found</td></tr>'}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align:right;border:1px solid #e5e7eb;">Subtotal</td>
          <td style="text-align:right;border:1px solid #e5e7eb;">₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" style="text-align:right;border:1px solid #e5e7eb;">Grand Total (INR)</td>
          <td style="text-align:right;border:1px solid #e5e7eb;">₹${grandTotal.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="footer">
      Thank you for your order. This is a computer-generated invoice and does not require a signature.<br/>
      For support, contact care@zarwinto.com
    </div>
  </div>
  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=820,height=1000');
    if (!win) {
      addToast('Popup blocked. Please allow popups to generate the invoice.', 'error');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredOrders.length} of {orders.length} total orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-card/50 text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const users = order.users as { full_name: string; email: string } | null;
            const orderItems = order.order_items as any[] || [];
            const itemStore = orderItems[0]?.stores as { name: string; slug?: string; logo_url?: string } | null;
            const productStore = orderItems[0]?.products?.stores as { name: string; slug?: string; logo_url?: string } | null;
            const store =
              (order.stores as { name: string; slug?: string; logo_url?: string } | null) ||
              itemStore ||
              productStore ||
              null;
            const shippingAddress = order.shipping_address as any || {};
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="glass-card rounded-2xl overflow-hidden border border-border">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-muted-foreground bg-zinc-900 px-2 py-1 rounded">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                        {store?.name && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Store className="h-3 w-3" /> {store.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{users?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">•</p>
                        <p className="text-xs text-muted-foreground">{users?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground">₹{Number(order.total_amount).toFixed(2)}</p>
                         <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExpand(order.id)}
                          className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-muted border border-border rounded-lg transition-all"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-border space-y-6">
                      {/* Order Items */}
                      <div>
                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" /> Order Items ({orderItems.length})
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => generateInvoice(order)}
                              className="text-xs text-primary hover:text-primary-hover border border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold"
                            >
                              <Receipt className="h-3.5 w-3.5" /> Generate Invoice
                            </button>
                            {orderItems.length === 0 && (
                            <button
                              onClick={async () => {
                                const supabase = createClient();
                                const { data: items } = await supabase
                                  .from('order_items')
                                  .select('*, stores(name, slug, logo_url), products(title, price, sale_price, stores(name, slug, logo_url), product_images(image_url, sort_order))')
                                  .eq('order_id', order.id);
                                if (items && items.length > 0) {
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, order_items: items } : o));
                                }
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" /> Refresh
                            </button>
                          )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {orderItems.length === 0 ? (
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-center">
                              <Package className="h-8 w-8 text-yellow-500/50 mx-auto mb-2" />
                              <p className="text-sm text-yellow-400 font-medium">No item details available</p>
                              <p className="text-xs text-muted-foreground mt-1">This order was placed before item tracking was implemented.</p>
                              <p className="text-xs text-muted-foreground">Order Total: ₹{Number(order.total_amount).toFixed(2)}</p>
                            </div>
                          ) : (
                            orderItems.map((item: any, idx: number) => {
                              // Prefer the snapshot on the order_item, then fall back to the
                              // live product image (in case the snapshot is empty/broken).
                              const imageUrl =
                                item.product_image ||
                                item.products?.product_images?.[0]?.image_url ||
                                '';
                              const imgKey = `${order.id}-${idx}`;
                              const productTitle = item.product_title || item.products?.title || 'Unknown Product';
                              const size = item.size || item.variant_size || '';
                              const color = item.color || item.variant_color || '';
                              const qty = item.quantity ?? 1;
                              const price = Number(item.price ?? 0);
                              const total = price * qty;
                              const showImage = imageUrl && !imgErrors[imgKey];
                              return (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-secondary rounded-xl border border-border">
                                  {showImage ? (
                                    <img
                                      src={imageUrl}
                                      alt={productTitle}
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      onError={() => setImgErrors(prev => ({ ...prev, [imgKey]: true }))}
                                      className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0 bg-zinc-900"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{productTitle}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {[
                                        size ? `Size: ${size}` : null,
                                        color && color !== 'Default' ? `Color: ${color}` : null,
                                        `Qty: ${qty}`
                                      ].filter(Boolean).join(' • ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {price > 0 ? `₹${price.toFixed(2)} each` : ''}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-foreground">₹{total.toFixed(2)}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Shipping Address
                        </h3>
                        <div className="p-3 bg-secondary rounded-lg text-sm">
                          <p className="text-foreground">{shippingAddress.full_name || shippingAddress.fullName || 'N/A'}</p>
                          <p className="text-muted-foreground">{shippingAddress.address_line1 || shippingAddress.addressLine1 || 'N/A'}</p>
                          <p className="text-muted-foreground">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                          <p className="text-muted-foreground">{shippingAddress.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Cashfree Payment Info */}
                      {(order as any).cashfree_order_id && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Cashfree Payment Details
                          </h3>
                          <div className="p-3 bg-secondary rounded-lg text-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Cashfree Order ID</span>
                              <span className="font-mono text-foreground">#{(order as any).cashfree_order_id}</span>
                            </div>
                            {(order as any).cashfree_payment_id && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Payment ID</span>
                                <span className="font-mono text-foreground">{(order as any).cashfree_payment_id}</span>
                              </div>
                            )}
                            {(order as any).cashfree_payment_method && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="text-foreground">{(order as any).cashfree_payment_method}</span>
                              </div>
                            )}
                            {(order as any).cashfree_payment_status && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Payment Status</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getPaymentStatusColor((order as any).cashfree_payment_status)}`}>
                                  {(order as any).cashfree_payment_status}
                                </span>
                              </div>
                            )}
                            {(order as any).cashfree_payment_message && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Message</span>
                                <span className="text-foreground text-xs">{(order as any).cashfree_payment_message}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cancel Reason */}
                      {order.status === 'cancelled' && order.cancel_reason && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" /> Cancellation Reason
                          </h3>
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
                            <p className="text-red-400 font-medium">{order.cancel_reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Shiprocket Tracking Info */}
                      {(order as any).shiprocket_order_id && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Shiprocket Tracking
                          </h3>
                          <div className="p-3 bg-secondary rounded-lg text-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Shiprocket Order ID</span>
                              <span className="font-mono text-foreground">#{(order as any).shiprocket_order_id}</span>
                            </div>
                            {(order as any).awb_code && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">AWB Code</span>
                                <span className="font-mono text-foreground">{(order as any).awb_code}</span>
                              </div>
                            )}
                            {(order as any).courier_name && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Courier</span>
                                <span className="text-foreground">{(order as any).courier_name}</span>
                              </div>
                            )}
                            {(order as any).shiprocket_order_id && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-2">
                                <a
                                  href={`https://app.shiprocket.in/orders/${(order as any).shiprocket_order_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors font-bold mr-auto"
                                >
                                  View in Dashboard <ExternalLink className="h-3 w-3" />
                                </a>

                                {!(order as any).awb_code && (
                                  <button
                                    onClick={() => handleGenerateAWB(order.id, (order as any).shipment_id)}
                                    disabled={updatingId === order.id}
                                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                  >
                                    Assign Courier & Generate AWB
                                  </button>
                                )}

                                {(order as any).awb_code && (
                                  <>
                                    <a
                                      href={`/api/shiprocket/label?shipmentId=${(order as any).shipment_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      Download Label
                                    </a>
                                    <button
                                      onClick={() => handleCancelShipment(order.id, (order as any).shipment_id)}
                                      disabled={updatingId === order.id}
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                    >
                                      Cancel Shipment
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status Updates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground mb-2">Order Status</label>
                          <div className="flex items-center gap-2">
                            <select
                              disabled={updatingId === order.id}
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              className="flex-1 bg-card border border-border text-foreground rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                            >
                              {statuses.map(st => (
                                <option key={st} value={st}>
                                  {st.charAt(0).toUpperCase() + st.slice(1)}
                                </option>
                              ))}
                            </select>
                            {updatingId === order.id && (
                              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground mb-2">Payment Status</label>
                          <div className="flex items-center gap-2">
                            <select
                              disabled={updatingId === order.id}
                              value={order.payment_status}
                              onChange={e => handlePaymentStatusChange(order.id, e.target.value)}
                              className="flex-1 bg-card border border-border text-foreground rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                            >
                              {paymentStatuses.map(st => (
                                <option key={st} value={st}>
                                  {st.charAt(0).toUpperCase() + st.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={observerRef} className="flex items-center justify-center py-6">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Loading more orders...
            </div>
          )}
        </div>
      )}

      {!hasMore && orders.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">All orders loaded</p>
      )}
    </div>
  );
}
