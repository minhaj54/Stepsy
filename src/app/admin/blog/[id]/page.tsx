import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAdminBlogPosts } from '../../../../lib/data/products';
import BlogEditorClient from '../BlogEditorClient';

export const metadata = {
  title: 'Edit Blog Post - Super Admin',
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posts = await getAdminBlogPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) notFound();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Blog
      </Link>
      <BlogEditorClient mode="edit" post={post} />
    </div>
  );
}
