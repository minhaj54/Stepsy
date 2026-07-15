'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Check, Trash2, MessageSquare, AlertCircle, Search, Filter, Package } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface StoreReviewsClientProps {
  initialReviews: any[];
  storeSlug: string;
}

export default function StoreReviewsClient({ initialReviews, storeSlug }: StoreReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  const configured = isSupabaseConfigured();

  const handleApprove = async (id: string) => {
    setUpdatingId(id);

    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, approved: true } : r))
    );

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

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this review?')) return;

    setReviews(prev => prev.filter(r => r.id !== id));

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) {
        console.error('Error deleting review in Supabase:', error);
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review_text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && review.approved) ||
                         (statusFilter === 'pending' && !review.approved);
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href={`/store/${storeSlug}/manage`}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reviews</h1>
          <p className="text-zinc-400 text-sm mt-1">{filteredReviews.length} of {reviews.length} reviews • {pendingCount} pending approval</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by customer, product, or review text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value as any)}
            className="bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div key={review.id} className="glass-card rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{review.user_name}</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{review.product_title}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{review.review_text}</p>
                    <p className="text-xs text-zinc-500 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={updatingId === review.id}
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {review.approved && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                    <Check className="h-3 w-3" /> Approved
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
