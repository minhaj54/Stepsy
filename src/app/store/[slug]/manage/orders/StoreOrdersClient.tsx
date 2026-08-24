'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye, Search, Filter, Package, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, CreditCard, Printer, FileText } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

interface StoreOrdersClientProps {
  initialOrders: any[];
  storeSlug: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function StoreOrdersClient({ initialOrders, storeSlug }: StoreOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const configured = isSupabaseConfigured();
  const { addToast } = useToast();

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

  // Generate a printable invoice in a new window
  const generateInvoice = (order: any) => {
    const items = (order.order_items ?? []).map((item: any) => {
      const price = Number(item.products?.price || 0);
      const salePrice = Number(item.products?.sale_price || 0);
      const effectivePrice = salePrice > 0 ? salePrice : price;
      const size = item.size || item.variant_size;
      const color = item.color || item.variant_color;
      return {
        name: item.products?.title || 'Product',
        size: size || '',
        color: color || '',
        qty: item.quantity,
        price: effectivePrice.toFixed(2),
        subtotal: (effectivePrice * item.quantity).toFixed(2),
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
    const total = Number(order.total_amount || subtotal).toFixed(2);

    const invoiceHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice #${order.id.slice(0, 8)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #18181b; background: #fff; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #18181b; padding-bottom: 16px; }
  .store-name { font-size: 24px; font-weight: 800; }
  .store-tagline { font-size: 12px; color: #71717a; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
  .invoice-title p { font-size: 13px; color: #71717a; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-box { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; }
  .info-box label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #71717a; display: block; margin-bottom: 4px; }
  .info-box p { font-size: 14px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; padding: 8px 12px; border-bottom: 2px solid #e4e4e7; }
  td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e4e4e7; }
  .text-right { text-align: right; }
  .text-bold { font-weight: 700; }
  .totals { margin-top: 16px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total-row.grand { font-size: 18px; font-weight: 800; border-top: 2px solid #18181b; padding-top: 12px; margin-top: 8px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 11px; color: #a1a1aa; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
  .no-print { margin-top: 32px; text-align: center; }
  .no-print button { background: #18181b; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .no-print button:hover { background: #3f3f46; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="store-name">Zarwinto</div>
      <div class="store-tagline">Premium Footwear Marketplace</div>
    </div>
    <div class="invoice-title">
      <h1>Invoice</h1>
      <p>#${order.id.slice(0, 8)}</p>
      <p>${formatDate(order.created_at)}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <div class="info-grid">
      <div class="info-box">
        <label>Customer</label>
        <p>${order.users?.full_name || 'Unknown'}</p>
      </div>
      <div class="info-box">
        <label>Phone</label>
        <p>${order.users?.phone || 'N/A'}</p>
      </div>
    </div>
  </div>

  ${order.shipping_address ? `
  <div class="section">
    <div class="section-title">Shipping Address</div>
    <div class="info-box">
      <p>${order.shipping_address.full_name || order.shipping_address.fullName}</p>
      <p>${order.shipping_address.address_line1 || order.shipping_address.addressLine1}</p>
      <p>${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}</p>
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr><th>Item</th><th>Size</th><th>Color</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Subtotal</th></tr>
      </thead>
      <tbody>
        ${items.map((item: any) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.size || '-'}</td>
          <td>${item.color || '-'}</td>
          <td class="text-right">${item.qty}</td>
          <td class="text-right">₹${item.price}</td>
          <td class="text-right">₹${item.subtotal}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
      <div class="total-row grand"><span>Total</span><span>₹${total}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Payment</div>
    <div class="info-box">
      <p>Status: <strong>${order.payment_status}</strong></p>
      ${order.cashfree_order_id ? `<p>Cashfree Order: #${order.cashfree_order_id}</p>` : ''}
      ${order.cashfree_payment_id ? `<p>Payment ID: ${order.cashfree_payment_id}</p>` : ''}
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your order! This is a computer-generated invoice.</p>
  </div>

  <div class="no-print">
    <button onclick="window.print()">🖨 Print Invoice</button>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href={`/store/${storeSlug}/manage`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your store orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
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
            {statuses.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{order.users?.full_name || 'Unknown Customer'}</p>
                       <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <p className="text-sm font-black text-foreground">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Expandable Order Details */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {expandedOrder === order.id ? 'Hide' : 'View'} Details
                </button>

                {expandedOrder === order.id && (
                   <div className="mt-4 pt-4 border-t border-border space-y-4">
                     {/* Order Items */}
                     <div>
                       <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items</h4>
                       <div className="space-y-2">
                           {(order.order_items ?? []).map((item: any) => {
                             const imgKey = `${order.id}-${item.id}`;
                             const imageUrl =
                               item.product_image ||
                               item.products?.product_images?.[0]?.image_url ||
                               '';
                             const size = item.size || item.variant_size;
                             const color = item.color || item.variant_color;
                             const showImage = imageUrl && !imgErrors[imgKey];
                             return (
                               <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                                 <div className="flex items-center gap-3">
                                   {showImage ? (
                                     <img
                                       src={imageUrl}
                                       alt={item.products?.title || 'Product'}
                                       loading="lazy"
                                       referrerPolicy="no-referrer"
                                       onError={() => setImgErrors(prev => ({ ...prev, [imgKey]: true }))}
                                       className="w-10 h-10 rounded-lg object-cover bg-zinc-900"
                                     />
                                   ) : (
                                     <Package className="h-4 w-4 text-muted-foreground" />
                                   )}
                                  <div>
                                    <p className="text-sm text-foreground">{item.products?.title || 'Product'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {[
                                        size ? `Size: ${size}` : null,
                                        color ? `Color: ${color}` : null,
                                        `Qty: ${item.quantity}`
                                      ].filter(Boolean).join(' • ')}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-foreground">₹{Number(item.products?.price || 0).toFixed(2)}</p>
                              </div>
                            );
                          })}
                       </div>
                     </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</h4>
                        <div className="p-3 bg-secondary rounded-xl flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_address.full_name || order.shipping_address.fullName}<br />
                            {order.shipping_address.address_line1 || order.shipping_address.addressLine1}<br />
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                     {/* Cashfree Payment Info */}
                     {(order as any).cashfree_order_id && (
                       <div>
                         <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cashfree Payment</h4>
                         <div className="p-3 bg-secondary rounded-xl space-y-2">
                           <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Order ID</span>
                             <span className="font-mono text-foreground">#{(order as any).cashfree_order_id}</span>
                           </div>
                           {(order as any).cashfree_payment_id && (
                             <div className="flex items-center justify-between text-xs">
                               <span className="text-muted-foreground">Payment ID</span>
                               <span className="font-mono text-foreground">{(order as any).cashfree_payment_id}</span>
                             </div>
                           )}
                           {(order as any).cashfree_payment_method && (
                             <div className="flex items-center justify-between text-xs">
                               <span className="text-muted-foreground">Method</span>
                               <span className="text-foreground">{(order as any).cashfree_payment_method}</span>
                             </div>
                           )}
                           {(order as any).cashfree_payment_status && (
                             <div className="flex items-center justify-between text-xs">
                               <span className="text-muted-foreground">Status</span>
                               <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getPaymentStatusColor((order as any).cashfree_payment_status)}`}>
                                 {(order as any).cashfree_payment_status}
                               </span>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

                     {/* Cancel Reason */}
                     {order.status === 'cancelled' && order.cancel_reason && (
                       <div>
                         <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cancellation Reason</h4>
                         <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                           <p className="text-xs text-red-400 font-medium">{order.cancel_reason}</p>
                         </div>
                       </div>
                     )}

                    {/* Generate Invoice Button */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Invoice</h4>
                      <button
                        onClick={() => generateInvoice(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" /> Generate Invoice
                      </button>
                    </div>

                     {/* Status Update */}
                     <div>
                       <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Update Status</h4>
                       <div className="flex flex-wrap gap-2">
                         {statuses.map(status => (
                           <button
                             key={status}
                             onClick={() => handleStatusChange(order.id, status)}
                             disabled={updatingId === order.id}
                             className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                               order.status === status
                                 ? 'bg-primary text-white'
                                 : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                             }`}
                           >
                             {status.charAt(0).toUpperCase() + status.slice(1)}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Payment Status Update */}
                     <div>
                       <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment Status</h4>
                       <div className="flex items-center gap-2">
                         <select
                           value={order.payment_status}
                           onChange={e => handlePaymentStatusChange(order.id, e.target.value)}
                           disabled={updatingId === order.id}
                           className="flex-1 bg-secondary border border-border text-foreground rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                         >
                           {paymentStatuses.map(st => (
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
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
