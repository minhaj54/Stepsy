'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Send,
  Upload,
  Image as ImageIcon,
  Tag as TagIcon,
  X,
  Eye,
  FileText,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import type { AdminBlogPost } from '../../../lib/data/products';

interface BlogEditorClientProps {
  mode: 'create' | 'edit';
  post?: AdminBlogPost;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogEditorClient({ mode, post }: BlogEditorClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [summary, setSummary] = useState(post?.summary ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [category, setCategory] = useState(post?.category ?? 'Guides');
  const [readTime, setReadTime] = useState(post?.read_time ?? '');
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState(post?.featured_image ?? '');
  const [published, setPublished] = useState(Boolean(post?.published_at));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from title until the user manually edits it
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  // Auto-estimate read time from content word count
  useEffect(() => {
    if (readTime) return;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    if (words > 0) {
      const mins = Math.max(1, Math.round(words / 200));
      setReadTime(`${mins} min read`);
    }
  }, [content, readTime]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageUrl || !imageUrl.startsWith('blob:')) return imageUrl || null;

    const supabase = createClient();
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, blob, { contentType: blob.type });

    if (error) throw new Error('Image upload failed');

    const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required.';
    if (!slug.trim()) return 'Slug is required.';
    if (!summary.trim()) return 'Summary is required.';
    if (!content.trim()) return 'Content is required.';
    if (!category.trim()) return 'Category is required.';
    return null;
  };

  const handleSave = async (shouldPublish: boolean) => {
    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }

    setSaving(true);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const finalImage = await uploadImageIfNeeded();

      const payload: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content,
        category: category.trim(),
        read_time: readTime.trim() || null,
        tags,
        featured_image: finalImage,
        published_at: shouldPublish ? post?.published_at ?? new Date().toISOString() : post?.published_at ?? null,
      };

      let error;
      if (mode === 'edit' && post) {
        ({ error } = await supabase.from('blog_posts').update(payload).eq('id', post.id));
      } else {
        ({ error } = await supabase.from('blog_posts').insert(payload));
      }

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to save post.' });
      } else {
        setMessage({
          type: 'success',
          text: shouldPublish ? 'Post published!' : 'Draft saved!',
        });
        setTimeout(() => router.push('/admin/blog'), 800);
      }
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === 'create' ? 'Create Blog Post' : 'Edit Blog Post'}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Craft an article and publish it to your store's magazine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <Eye className="h-4 w-4" /> {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
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

      {showPreview ? (
        <div className="glass-card rounded-2xl p-8 border border-white/[0.04]">
          <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase rounded-lg">
            {category || 'Category'}
          </span>
          <h2 className="text-3xl font-black text-white mt-3">{title || 'Untitled Post'}</h2>
          {readTime && <p className="text-zinc-500 text-xs mt-2">{readTime}</p>}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full aspect-[16/9] object-cover rounded-2xl my-5"
            />
          )}
          <p className="text-lg text-white font-semibold border-l-2 border-primary pl-4 mb-4">
            {summary}
          </p>
          <div className="prose prose-invert max-w-none text-zinc-300 space-y-4">
            {content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-zinc-900 border border-white/[0.05] text-zinc-300 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g., Sneaker Care 101"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Slug
                </label>
                <div className="flex items-center bg-zinc-900 border border-white/[0.06] rounded-xl px-3 focus-within:border-primary">
                  <span className="text-zinc-500 text-sm">/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    className="flex-grow bg-transparent text-white py-2.5 text-sm outline-none"
                    placeholder="sneaker-care-101"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  placeholder="A short, catchy excerpt shown on the magazine grid."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-y font-mono leading-relaxed"
                  placeholder="Write your article here. Use blank lines to separate paragraphs."
                />
                <p className="text-[11px] text-zinc-500">
                  {content.trim().split(/\s+/).filter(Boolean).length} words · auto read time:{' '}
                  {readTime || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Publish
              </h3>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Guides"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="auto"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-grow bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-xl text-zinc-300"
                  >
                    <TagIcon className="h-4 w-4" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        {t}
                        <button type="button" onClick={() => removeTag(t)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> {saving ? 'Saving...' : 'Publish'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> Save Draft
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Featured Image
              </h3>
              <div className="relative aspect-[16/9] w-full bg-zinc-900 rounded-xl overflow-hidden">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Upload className="h-4 w-4" /> Upload Image
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="w-full text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
