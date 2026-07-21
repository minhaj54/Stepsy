'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Newspaper,
  ExternalLink,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import type { AdminBlogPost } from '../../../lib/data/products';

interface AdminBlogClientProps {
  initialPosts: AdminBlogPost[];
}

export default function AdminBlogClient({ initialPosts }: AdminBlogClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminBlogPost[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [posts, search]);

  const publishedCount = posts.filter((p) => p.published_at).length;

  const togglePublish = async (post: AdminBlogPost) => {
    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      return;
    }
    setBusyId(post.id);
    setMessage(null);
    const supabase = createClient();
    const newPublished = post.published_at ? null : new Date().toISOString();

    const { error } = await supabase
      .from('blog_posts')
      .update({ published_at: newPublished })
      .eq('id', post.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update publish status.' });
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published_at: newPublished } : p))
      );
      setMessage({
        type: 'success',
        text: newPublished ? 'Post published.' : 'Post moved to draft.',
      });
    }
    setBusyId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (post: AdminBlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      return;
    }
    setBusyId(post.id);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to delete post.' });
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setMessage({ type: 'success', text: 'Post deleted.' });
    }
    setBusyId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-primary" /> Blog Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length} posts · {publishedCount} published · {posts.length - publishedCount} drafts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts by title, category, or slug..."
            className="w-full bg-card text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No blog posts found.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 mt-4 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const isPublished = Boolean(post.published_at);
            return (
              <div
                key={post.id}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-border"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                  {post.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.featured_image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Newspaper className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-zinc-700/40 text-muted-foreground'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs font-semibold text-primary">{post.category}</span>
                  </div>
                  <h3 className="text-foreground font-bold truncate mt-1">{post.title}</h3>
                  <p className="text-muted-foreground text-xs truncate">
                    /blog/{post.slug}
                    {post.published_at &&
                      ` · ${new Date(post.published_at).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPublished && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      title="View live"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => togglePublish(post)}
                    disabled={busyId === post.id}
                    title={isPublished ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    title="Edit"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post)}
                    disabled={busyId === post.id}
                    title="Delete"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
