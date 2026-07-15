import React, { Suspense } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { getBlogPosts } from '../../lib/data/products';

export const metadata = {
  title: "Whishkhu Magazine - Footwear Trends & Guides",
  description: "Explore footwear styling tips, sneaker maintenance guides, and technical gear industry reviews."
};

export default async function BlogIndexPage() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
          Whishkhu Editorial
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">The Footwear Magazine</h1>
        <p className="text-zinc-500 text-sm">Your primary source for sneaker trends, care guides, and industry logs.</p>
      </div>

      {blogPosts[0] && (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/[0.05] grid grid-cols-1 md:grid-cols-12 gap-6 items-center group">
          <div className="md:col-span-7 aspect-[16/10] overflow-hidden bg-zinc-950/20">
            <img
              src={blogPosts[0].featured_image}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="md:col-span-5 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
              <span className="text-primary font-bold">{blogPosts[0].category}</span>
              <span className="h-3 w-[1px] bg-white/[0.08]" />
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {blogPosts[0].read_time}</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-primary transition-colors leading-tight">
              <Link href={`/blog/${blogPosts[0].slug}`}>{blogPosts[0].title}</Link>
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed">{blogPosts[0].summary}</p>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {new Date(blogPosts[0].published_at).toLocaleDateString()}
              </span>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary-hover group-hover:translate-x-1.5 transition-transform"
              >
                Read Article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {blogPosts.slice(1).map((post) => (
          <div key={post.id} className="glass-card rounded-2xl overflow-hidden border border-white/[0.04] flex flex-col group">
            <div className="aspect-[16/10] overflow-hidden bg-zinc-950/20">
              <img
                src={post.featured_image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                  <span className="text-primary font-bold">{post.category}</span>
                  <span className="h-3 w-[1px] bg-white/[0.08]" />
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{post.summary}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-between items-center text-xs">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
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
    </div>
  );
}
