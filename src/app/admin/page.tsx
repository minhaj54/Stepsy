import React from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import { getAdminStats } from '../../lib/data/products';

export const metadata = {
  title: 'Admin Dashboard - Stepzy',
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const quickLinks = [
    { label: 'Manage Products', href: '/admin/products', description: 'Create, edit, and manage inventory' },
    { label: 'View Orders', href: '/admin/orders', description: 'Process orders and update status' },
    { label: 'Customers', href: '/admin/customers', description: 'View customer profiles and history' },
    { label: 'Manage Reviews', href: '/admin/reviews', description: 'Approve or remove customer feedback' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Overview of your Stepzy store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group flex flex-col justify-between h-full"
          >
            <div>
              <h3 className="font-bold text-white group-hover:text-primary transition-colors">{link.label}</h3>
              <p className="text-xs text-zinc-500 mt-1">{link.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-primary mt-4 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
