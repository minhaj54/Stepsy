'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, TrendingUp, Store as StoreIcon } from 'lucide-react';

interface StoreDashboardClientProps {
  stats: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
  };
  storeSlug: string;
}

export default function StoreDashboardClient({ stats, storeSlug }: StoreDashboardClientProps) {
  const cards = [
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+12.5%' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10', trend: '+8.2%' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'text-accent', bg: 'bg-accent/10', trend: '+15.3%' },
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+3.1%' },
  ];

  const quickLinks = [
    { label: 'Manage Products', href: `/store/${storeSlug}/manage/products`, description: 'Create, edit, and manage inventory', icon: Package },
    { label: 'View Orders', href: `/store/${storeSlug}/manage/orders`, description: 'Process orders and update status', icon: ShoppingBag },
    { label: 'Manage Reviews', href: `/store/${storeSlug}/manage/reviews`, description: 'Approve or remove customer feedback', icon: StoreIcon },
    { label: 'Store Settings', href: `/store/${storeSlug}/manage/settings`, description: 'Update store information', icon: TrendingUp },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-6 hover:border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-foreground">{card.value}</p>
              <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                <TrendingUp className="h-3 w-3" />
                {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* Store Info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Your Store</h2>
          <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
              <StoreIcon className="h-6 w-6 text-muted-foreground m-3" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm truncate">Store Admin</p>
              <p className="text-xs text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link
              href={`/store/${storeSlug}`}
              className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-border hover:bg-secondary transition-colors group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground">View Storefront</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href={`/store/${storeSlug}/manage/settings`}
              className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-border hover:bg-secondary transition-colors group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground">Store Settings</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
