'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye, Search, Filter, Package, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

interface StoreOrdersClientProps {
  initialOrders: any[];
  storeSlug: string;
}

export default function StoreOrdersClient({ initialOrders, storeSlug }: StoreOrdersClientProps) {
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
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
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
                        {(order.order_items ?? []).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground">{item.products?.title || 'Product'}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-foreground">₹{Number(item.products?.price || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</h4>
                        <div className="p-3 bg-secondary rounded-xl flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_address.fullName}<br />
                            {order.shipping_address.addressLine1}<br />
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Shiprocket Tracking Info */}
                    {(order as any).shiprocket_order_id && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shiprocket Tracking</h4>
                        <div className="p-3 bg-secondary rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Shiprocket Order ID</span>
                            <span className="font-mono text-foreground">#{(order as any).shiprocket_order_id}</span>
                          </div>
                          {(order as any).awb_code && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">AWB Code</span>
                              <span className="font-mono text-foreground">{(order as any).awb_code}</span>
                            </div>
                          )}
                          {(order as any).courier_name && (
                            <div className="flex items-center justify-between text-xs">
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
                                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover transition-colors font-bold mr-auto"
                                >
                                  View in Dashboard <ExternalLink className="h-3 w-3" />
                                </a>

                                {!(order as any).awb_code && (
                                  <button
                                    onClick={() => handleGenerateAWB(order.id, (order as any).shipment_id)}
                                    disabled={updatingId === order.id}
                                    className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-2 py-1 rounded transition-all disabled:opacity-50"
                                  >
                                    Generate AWB
                                  </button>
                                )}

                                {(order as any).awb_code && (
                                  <>
                                    <a
                                      href={`/api/shiprocket/label?shipmentId=${(order as any).shipment_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-zinc-850 hover:bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded transition-all"
                                    >
                                      Download Label
                                    </a>
                                    <button
                                      onClick={() => handleCancelShipment(order.id, (order as any).shipment_id)}
                                      disabled={updatingId === order.id}
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded transition-all disabled:opacity-50"
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
