'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, Users, Store as StoreIcon, Package, Tags, Image as ImageIcon, ShoppingBag, MessageSquare, Settings, Newspaper, Star } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

export default function AdminMobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-background border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-3 space-y-1 overflow-y-auto">
              {items.map((item) => {
                const Icon = iconMap[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
