'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Check, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminReviewsClientProps {
  initialReviews: any[];
}

export default function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleApprove = async (id: string) => {
    setUpdatingId(id);

    // 1. Update Locally
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, approved: true } : r))
    );

    // 2. Update DB
    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', id);

      if (error) {
        console.error('Error approving review in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setReviews(prev => prev.filter(r => r.id !== id));

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) {
        console.error('Error deleting review in Supabase:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Review Moderation</h1>
          <p className="text-zinc-400 text-sm mt-1">{reviews.length} total customer reviews</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/[0.05]">
          <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No customer reviews to show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                review.approved
                  ? 'border-white/[0.04]'
                  : 'border-yellow-500/20 bg-yellow-500/[0.02]'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {review.user_name || 'Anonymous'}
                  </h4>
                  <p className="text-[10px] text-zinc-500">{review.user_email}</p>
                </div>
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating ? 'fill-accent' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Product
                </span>
                <p className="font-bold text-primary text-xs mt-0.5 leading-snug">
                  {review.product_title}
                </p>
              </div>

              <div className="mb-5 bg-zinc-950/40 p-3 rounded-xl border border-white/[0.03]">
                <p className="text-zinc-300 text-xs italic leading-relaxed">
                  "{review.review_text}"
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/[0.04] text-xs">
                <div className="flex items-center gap-1.5">
                  {review.approved ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-500/10 border border-green-500/15 px-2 py-0.5 rounded">
                      <Check className="h-3 w-3" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/15 px-2 py-0.5 rounded animate-pulse">
                      <AlertCircle className="h-3 w-3" /> Pending Review
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!review.approved && (
                    <button
                      disabled={updatingId === review.id}
                      onClick={() => handleApprove(review.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
