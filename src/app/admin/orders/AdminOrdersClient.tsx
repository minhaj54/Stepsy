'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye, Search, Filter, Package, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, ExternalLink, CreditCard } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { useToast } from '../../../components/Toast';

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
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
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400';
      case 'unpaid': return 'bg-red-500/10 text-red-400';
      case 'refunded': return 'bg-yellow-500/10 text-yellow-400';
      case 'cod_pending': return 'bg-orange-500/10 text-orange-400';
      default: return 'bg-zinc-500/10 text-muted-foreground';
    }
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
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
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
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" /> Order Items ({orderItems.length})
                        </h3>
                        <div className="space-y-2">
                          {orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{item.products?.title || 'Product'}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-foreground">₹{Number(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Shipping Address
                        </h3>
                        <div className="p-3 bg-secondary rounded-lg text-sm">
                          <p className="text-foreground">{shippingAddress.full_name || 'N/A'}</p>
                          <p className="text-muted-foreground">{shippingAddress.address_line1 || 'N/A'}</p>
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
    </div>
  );
}
