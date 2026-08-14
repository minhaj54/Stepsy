import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Store as StoreIcon, Package, Tags, Image as ImageIcon, ShoppingBag, MessageSquare, Settings, ArrowLeft, Shield, Newspaper, Star } from 'lucide-react';
import { getCurrentUser } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminMobileNav from './AdminMobileNav';

const adminNav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Stores', href: '/admin/stores' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Banners', href: '/admin/banners' },
  { label: 'Blog', href: '/admin/blog' },
  { label: 'Hero Shoe', href: '/admin/hero-shoe' },
  { label: 'Testimonials', href: '/admin/testimonials' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'Settings', href: '/admin/settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Only allow admin access
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const desktopIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '/admin': LayoutDashboard,
    '/admin/users': Users,
    '/admin/stores': StoreIcon,
    '/admin/products': Package,
    '/admin/categories': Tags,
    '/admin/banners': ImageIcon,
    '/admin/blog': Newspaper,
    '/admin/hero-shoe': Star,
    '/admin/testimonials': MessageSquare,
    '/admin/orders': ShoppingBag,
    '/admin/reviews': MessageSquare,
    '/admin/settings': Settings,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Store
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <span className="text-sm font-black text-foreground">
                  SUPER<span className="text-primary">ADMIN</span>
                </span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {adminNav.map((item) => {
                const Icon = desktopIconMap[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <AdminMobileNav items={adminNav} />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
