'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { cartCount, wishlist } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Sneakers', href: '/shop?category=sneakers' },
    { label: 'Boots', href: '/shop?category=boots' },
    { label: 'Formal', href: '/shop?category=formal' },
    { label: 'Blog', href: '/blog' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tighter text-white flex items-center">
                STEP<span className="text-primary group-hover:text-accent transition-colors duration-300">ZY</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-primary/20 text-primary rounded">
                MVP
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-md relative group"
          >
            <input
              type="text"
              placeholder="Search sneakers, boots, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] text-white placeholder-zinc-400 border border-white/[0.08] hover:border-white/[0.15] focus:border-primary focus:bg-white/[0.06] focus:ring-1 focus:ring-primary rounded-full py-2 pl-4 pr-10 outline-none transition-all duration-300 text-sm"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors duration-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '?');
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-white ${
                    isActive ? 'text-white border-b-2 border-primary pb-0.5' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Trigger */}
            <Link 
              href="/search" 
              className="p-2 text-zinc-400 hover:text-white md:hidden transition-colors rounded-full hover:bg-white/5"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Wishlist */}
            <Link 
              href="/account?tab=wishlist" 
              className="p-2 text-zinc-400 hover:text-white relative transition-colors rounded-full hover:bg-white/5"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full animate-ping" />
              )}
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="p-2 text-zinc-400 hover:text-white relative transition-colors rounded-full hover:bg-white/5"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-background">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link 
              href={user ? '/account' : '/auth/login'} 
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex items-center gap-1.5"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
              <span className="hidden xl:inline text-xs font-semibold max-w-[80px] truncate">
                {user ? user.full_name.split(' ')[0] : 'Sign In'}
              </span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden lg:inline px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent rounded-md hover:bg-accent/30 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white lg:hidden transition-colors rounded-full hover:bg-white/5"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-zinc-950 px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-5 duration-300">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search brands, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] text-white border border-white/[0.08] rounded-xl py-2.5 pl-4 pr-10 outline-none text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-zinc-300 hover:text-white hover:bg-white/[0.02] rounded-xl transition-all font-medium"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </Link>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-4 px-3 flex items-center justify-between">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View Profile
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
