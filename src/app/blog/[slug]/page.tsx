import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts } from '../../../lib/data/products';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found - Zarwinto Magazine"
    };
  }

  return {
    title: `${post.title} | Zarwinto Magazine`,
    description: post.summary
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  const fallbackRelated = related.length
    ? related
    : allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-grow space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Magazine
      </Link>

      <div className="space-y-3 sm:space-y-4">
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-extrabold uppercase rounded-md sm:rounded-lg">
          {post.category}
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString()}</span>
          <span className="h-3.5 w-[1px] bg-border" />
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.read_time}</span>
        </div>
      </div>

      <div className="aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-background/20">
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="prose prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed space-y-4 sm:space-y-6 pt-2 sm:pt-4">
        <p className="text-lg text-foreground font-semibold leading-relaxed border-l-2 border-primary pl-4">
          {post.summary}
        </p>
        
        {post.content.split('\n\n').map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </article>

      <div className="border-t border-border pt-6 flex flex-wrap gap-2 text-xs items-center">
        <span className="text-muted-foreground font-bold uppercase tracking-wide flex items-center gap-1 mr-1">
          <Tag className="h-3.5 w-3.5" /> Tags:
        </span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="bg-card border border-border text-muted-foreground px-3 py-1 rounded-lg font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>

      {fallbackRelated.length > 0 && (
        <div className="border-t border-border pt-10 mt-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-6">More from the Magazine</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {fallbackRelated.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="glass-card rounded-2xl overflow-hidden border border-border group"
              >
                <div className="aspect-[16/10] overflow-hidden bg-background/20">
                  <img
                    src={p.featured_image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{p.category}</span>
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
