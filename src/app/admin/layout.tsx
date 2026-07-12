import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Users, ArrowLeft } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Store
            </Link>
            <span className="text-sm font-black text-white">
              STEP<span className="text-primary">ZY</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-accent/20 text-accent px-1.5 py-0.5 rounded">Admin</span>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
