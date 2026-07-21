'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import type { BlogPost } from '../../types';

export default function BlogIndexClient({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, activeCategory]);

  const [featured, ...rest] = filtered;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow space-y-6 sm:space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
        <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
          Zarwinto Editorial
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-foreground tracking-tight">The Footwear Magazine</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Your primary source for sneaker trends, care guides, and industry logs.</p>
      </div>

      {/* Search + category filter */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">No articles match your search.</div>
      ) : (
        <>
          {featured && (
            <div className="glass-card rounded-3xl overflow-hidden border border-border grid grid-cols-1 md:grid-cols-12 gap-6 items-center group">
              <div className="md:col-span-7 aspect-[16/10] overflow-hidden bg-background/20">
                <img
                  src={featured.featured_image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="md:col-span-5 p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">{featured.category}</span>
                  <span className="h-3 w-[1px] bg-border" />
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.read_time}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed">{featured.summary}</p>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(featured.published_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary-hover group-hover:translate-x-1.5 transition-transform"
                  >
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rest.map((post) => (
              <div key={post.id} className="glass-card rounded-2xl overflow-hidden border border-border flex flex-col group">
                <div className="aspect-[16/10] overflow-hidden bg-background/20">
                  <img
                    src={post.featured_image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                      <span className="text-primary font-bold">{post.category}</span>
                      <span className="h-3 w-[1px] bg-border" />
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
                    </div>

                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{post.summary}</p>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(post.published_at).toLocaleDateString()}
                    </span>
                    <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                      Read <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
