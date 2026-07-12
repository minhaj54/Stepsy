import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '../../../lib/data/products';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found - Stepzy Magazine"
    };
  }

  return {
    title: `${post.title} | Stepzy Magazine`,
    description: post.summary
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8 animate-in fade-in duration-500">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Magazine
      </Link>

      <div className="space-y-4">
        <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase rounded-lg">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500 pt-1">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString()}</span>
          <span className="h-3.5 w-[1px] bg-white/[0.08]" />
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.read_time}</span>
        </div>
      </div>

      <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950/20">
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed space-y-6 pt-4">
        <p className="text-lg text-white font-semibold leading-relaxed border-l-2 border-primary pl-4">
          {post.summary}
        </p>
        
        {post.content.split('\n\n').map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </article>

      <div className="border-t border-white/[0.06] pt-6 flex flex-wrap gap-2 text-xs items-center">
        <span className="text-zinc-500 font-bold uppercase tracking-wide flex items-center gap-1 mr-1">
          <Tag className="h-3.5 w-3.5" /> Tags:
        </span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="bg-zinc-900 border border-white/[0.05] text-zinc-300 px-3 py-1 rounded-lg font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
