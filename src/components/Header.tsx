'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProductsClient } from '../lib/data/products.client';
import { Product } from '../types';
import ShimmerImage from './ShimmerImage';

interface Suggestion {
  type: 'product' | 'brand';
  label: string;
  sublabel?: string;
  image?: string;
  price?: number;
  href: string;
}

export const Header: React.FC = () => {
  const { cartCount, wishlist } = useCart();
  const { user } = useAuth();
  const { theme, themeMounted, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Guard against hydration mismatch: auth state, wishlist and cart counts are
  // resolved on the client after mount, so they differ between server and
  // client. Use `sessionUser` (null until mounted) for all auth-dependent UI.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sessionUser = mounted ? user : null;

  // Load products once for client-side autocomplete suggestions.
  useEffect(() => {
    let cancelled = false;
    getProductsClient().then((data) => {
      if (!cancelled) setProducts(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build suggestion list from the current query.
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const productHits: Suggestion[] = products
      .filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q) ||
        p.category_slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((p) => ({
        type: 'product',
        label: p.title,
        sublabel: p.brand_name,
        image: p.images[0],
        price: p.sale_price || p.price,
        href: `/product/${p.slug}`,
      }));

    const brandSet = new Set<string>();
    const brandHits: Suggestion[] = products
      .filter((p) => p.brand_name.toLowerCase().includes(q))
      .map((p) => p.brand_name)
      .filter((name) => {
        const key = name.toLowerCase();
        if (brandSet.has(key)) return false;
        brandSet.add(key);
        return true;
      })
      .slice(0, 3)
      .map((name) => ({
        type: 'brand',
        label: name,
        sublabel: 'Brand',
        href: `/search?q=${encodeURIComponent(name)}`,
      }));

    setSuggestions([...productHits, ...brandHits]);
    setActiveIndex(-1);
  }, [searchQuery, products]);

  // Close suggestions on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const goTo = (href: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(href);
  };

  const submitQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goTo(suggestions[activeIndex].href);
    } else {
      submitQuery(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Sneakers', href: '/shop?category=sneakers' },
    { label: 'Boots', href: '/shop?category=boots' },
    { label: 'Formal', href: '/shop?category=formal' },
    { label: 'Partners', href: '/partners' },
    { label: 'Blog', href: '/blog' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border backdrop-blur-md">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tighter text-foreground flex items-center">
                ZARW<span className="text-primary group-hover:text-accent transition-colors duration-300">INTO</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div
            ref={searchContainerRef}
            className="hidden md:flex flex-1 max-w-md relative group"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search sneakers, boots, brands..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="w-full bg-secondary text-foreground placeholder:text-muted-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted focus:ring-1 focus:ring-primary rounded-full py-2 pl-4 pr-10 outline-none transition-all duration-300 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Autocomplete dropdown */}
              {showSuggestions && searchQuery.trim() && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <ul className="max-h-[60vh] overflow-y-auto py-1">
                    {suggestions.map((s, i) => (
                      <li key={`${s.type}-${s.label}-${i}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => goTo(s.href)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                            i === activeIndex ? 'bg-secondary' : 'hover:bg-secondary'
                          }`}
                        >
                          {s.type === 'product' ? (
                            <>
                              <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-card border border-border">
                                {s.image && (
                                  <ShimmerImage src={s.image} alt={s.label} className="w-full h-full" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{s.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{s.sublabel}</p>
                              </div>
                              {s.price != null && (
                                <span className="text-sm font-bold text-primary flex-shrink-0">₹{s.price}</span>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-black">
                                {s.label.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{s.label}</p>
                                <p className="text-xs text-muted-foreground truncate">Search brand</p>
                              </div>
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => submitQuery(searchQuery)}
                    className="w-full border-t border-border px-3 py-2.5 text-left text-xs font-semibold text-primary hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    <Search className="h-3.5 w-3.5" />
                    See all results for &ldquo;{searchQuery.trim()}&rdquo;
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              let isActive = false;

              // Parse the link href to get base path and query params
              const [linkPath, linkQueryString] = link.href.split('?');
              const linkParams = new URLSearchParams(linkQueryString || '');

              // Check if pathname matches the base path
              if (pathname === linkPath || pathname.startsWith(linkPath + '/')) {
                if (linkQueryString) {
                  // For links with query params (e.g., /shop?category=sneakers)
                  // Active only if ALL query params match current search params
                  isActive = Array.from(linkParams.entries()).every(([key, value]) =>
                    searchParams.get(key) === value
                  );
                } else {
                  // For links without query params (e.g., /shop, /partners, /blog)
                  // Active only if there are no conflicting query params
                  // Specifically, "Shop All" should NOT be active when a category is selected
                  const hasCategoryFilter = searchParams.has('category');
                  isActive = !hasCategoryFilter;
                }
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-foreground ${
                    isActive ? 'text-foreground border-b-2 border-primary pb-0.5' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            {/* Mobile Search Trigger */}
            <Link
              href="/search"
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground md:hidden transition-colors rounded-full hover:bg-secondary"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {themeMounted ? (theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />) : <span className="h-4 w-4 sm:h-5 sm:w-5 block" />}
            </button>

            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground relative transition-colors rounded-full hover:bg-secondary"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 sm:top-1.5 sm:right-1.5 sm:h-2 sm:w-2 bg-accent rounded-full animate-ping" />
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground relative transition-colors rounded-full hover:bg-secondary"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] sm:text-[10px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center border border-background">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              href={sessionUser ? '/account' : '/auth/login'}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary flex items-center gap-1"
              aria-label="Account"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xl:inline text-[10px] sm:text-xs font-semibold max-w-[80px] truncate">
                {sessionUser ? sessionUser.full_name.split(' ')[0] : 'Sign In'}
              </span>
            </Link>

            {sessionUser?.role === 'admin' && (
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
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground lg:hidden transition-colors rounded-full hover:bg-secondary"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 w-6" /> : <Menu className="h-5 w-5 sm:h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-5 duration-300">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search brands, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full bg-secondary text-foreground border border-border rounded-xl py-2.5 pl-4 pr-10 outline-none text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all font-medium"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="border-t border-border pt-4 px-3 flex items-center justify-between">
            {sessionUser ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {sessionUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sessionUser.full_name}</p>
                    <p className="text-xs text-muted-foreground">{sessionUser.email}</p>
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
