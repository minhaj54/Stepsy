'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, Store as StoreIcon, ArrowRight, TrendingUp, Clock, CheckCircle, AlertCircle, MoreHorizontal } from 'lucide-react';

interface AdminDashboardClientProps {
  stats: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
  };
  recentOrders: any[];
  totalStores?: number;
  activeStores?: number;
  pendingStores?: number;
}

export default function AdminDashboardClient({ stats, recentOrders, totalStores = 0, activeStores = 0, pendingStores = 0 }: AdminDashboardClientProps) {
  const cards = [
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+12.5%' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10', trend: '+8.2%' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'text-accent', bg: 'bg-accent/10', trend: '+15.3%' },
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+3.1%' },
    { label: 'Total Stores', value: totalStores.toString(), icon: StoreIcon, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: `${activeStores} active` },
    { label: 'Pending Stores', value: pendingStores.toString(), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', trend: 'Needs review' },
  ];

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', description: 'View and manage all users', icon: Users },
    { label: 'Manage Stores', href: '/admin/stores', description: 'Approve and manage stores', icon: StoreIcon },
    { label: 'Manage Products', href: '/admin/products', description: 'Featured, new arrival, best seller', icon: Package },
    { label: 'Categories', href: '/admin/categories', description: 'Manage product categories', icon: Package },
    { label: 'Home Banner', href: '/admin/banners', description: 'Update hero banner', icon: StoreIcon },
    { label: 'View Orders', href: '/admin/orders', description: 'Process orders and update status', icon: ShoppingBag },
  ];

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
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening across the marketplace.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-5 hover:border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-foreground">{card.value}</p>
              <div className="flex items-center gap-1 text-green-400 text-[10px] font-semibold">
                <TrendingUp className="h-3 w-3" />
                {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-border hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{order.users?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{Number(order.total_amount).toFixed(2)}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border hover:bg-secondary hover:border-primary/20 transition-all group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{link.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace Activity */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Marketplace Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">New order received</p>
              <p className="text-xs text-muted-foreground">Order #12345 placed by John Doe</p>
              <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">New customer registered</p>
              <p className="text-xs text-muted-foreground">Jane Smith joined the marketplace</p>
              <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <StoreIcon className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">New store registered</p>
              <p className="text-xs text-muted-foreground">SneakerVault applied for store approval</p>
              <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
