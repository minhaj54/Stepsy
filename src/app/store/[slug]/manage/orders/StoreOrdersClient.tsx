'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye, Search, Filter, Package, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

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
  const paymentStatuses = ['unpaid', 'paid', 'refunded'];

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
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400';
      case 'unpaid': return 'bg-red-500/10 text-red-400';
      case 'refunded': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-zinc-500/10 text-zinc-400';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href={`/store/${storeSlug}/manage`}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage and track your store orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
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
          <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No orders found</p>
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
                      <p className="text-sm font-bold text-white">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-400">{order.users?.full_name || 'Unknown Customer'}</p>
                      <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <p className="text-sm font-black text-white">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Expandable Order Details */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {expandedOrder === order.id ? 'Hide' : 'View'} Details
                </button>

                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Items</h4>
                      <div className="space-y-2">
                        {(order.order_items ?? []).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-zinc-500" />
                              <div>
                                <p className="text-sm text-white">{item.products?.title || 'Product'}</p>
                                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-white">₹{Number(item.products?.price || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                        <div className="p-3 bg-white/[0.02] rounded-xl flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
                          <p className="text-xs text-zinc-300">
                            {order.shipping_address.fullName}<br />
                            {order.shipping_address.addressLine1}<br />
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Update */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
                            disabled={updatingId === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === status
                                ? 'bg-primary text-white'
                                : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
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
