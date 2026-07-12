'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag, Eye } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const configured = isSupabaseConfigured();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    // 1. Update Locally
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // 2. Update DB
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

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders</h1>
          <p className="text-zinc-400 text-sm mt-1">{orders.length} total orders placed</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/[0.05]">
          <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No orders yet. Orders will appear here once customers checkout.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 text-xs uppercase tracking-wider bg-white/[0.02]">
                  <th className="text-left p-4 font-semibold">Order ID</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Payment</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((order) => {
                  const users = order.users as { full_name: string; email: string } | null;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-zinc-400">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">
                          {users?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-zinc-500">{users?.email}</p>
                      </td>
                      <td className="p-4 font-black text-white">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            className="bg-zinc-900 border border-white/[0.06] text-white rounded-lg text-xs font-bold px-2.5 py-1.5 outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                          >
                            {statuses.map(st => (
                              <option key={st} value={st}>
                                {st.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id && (
                            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            order.payment_status === 'paid'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/10'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
