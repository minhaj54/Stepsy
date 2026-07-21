'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Settings, ExternalLink, ArrowLeft } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Products', href: 'products', icon: Package },
  { label: 'Orders', href: 'orders', icon: ShoppingBag },
  { label: 'Reviews', href: 'reviews', icon: MessageSquare },
  { label: 'Settings', href: 'settings', icon: Settings },
];

interface StoreAdminWrapperProps {
  children: React.ReactNode;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
}

export default function StoreAdminWrapper({ children, storeName, storeSlug, storeLogo }: StoreAdminWrapperProps) {
  const pathname = usePathname();
  
  // Extract the current tab from the pathname
  const currentTab = pathname.split('/').pop() || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Store-scoped admin header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${storeSlug}`}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Store
              </Link>
              <div className="h-px w-px bg-white/[0.08]" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-zinc-800 border border-border shrink-0">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Store Admin</p>
                  <h1 className="text-sm font-extrabold text-foreground truncate">{storeName}</h1>
                </div>
              </div>
            </div>
            <Link
              href={`/store/${storeSlug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary hover:bg-muted border border-border rounded-lg px-3 py-1.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Store
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-background/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const href = `/store/${storeSlug}/manage/${item.href}`;
              const isActive = currentTab === item.href || (item.href === '' && currentTab === 'manage');
              
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                        isActive
                          ? 'text-foreground border-primary'
                          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
                      }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
