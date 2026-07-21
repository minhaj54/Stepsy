import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Store as StoreIcon, Package, Tags, Image as ImageIcon, ShoppingBag, MessageSquare, Settings, ArrowLeft, Shield, Newspaper, Star } from 'lucide-react';
import { getCurrentUser } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Stores', href: '/admin/stores', icon: StoreIcon },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { label: 'Blog', href: '/admin/blog', icon: Newspaper },
  { label: 'Hero Shoe', href: '/admin/hero-shoe', icon: Star },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  // Only allow admin access
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

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
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden border-b border-border bg-card/50 overflow-x-auto">
        <div className="px-4 flex items-center gap-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      
      {children}
    </div>
  );
}
