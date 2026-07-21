import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogEditorClient from '../BlogEditorClient';

export const metadata = {
  title: 'New Blog Post - Super Admin',
};

export default function NewBlogPostPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Blog
      </Link>
      <BlogEditorClient mode="create" />
    </div>
  );
}
