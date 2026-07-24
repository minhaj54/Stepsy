'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Trash2, MessageSquare, Search, Filter, Package } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { recalculateProductRating } from '../../../lib/data/products.client';

interface AdminReviewsClientProps {
  initialReviews: any[];
}

export default function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  const configured = isSupabaseConfigured();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const review = reviews.find(r => r.id === id);
    const productId = review?.product_id;

    setReviews(prev => prev.filter(r => r.id !== id));

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) {
        console.error('Error deleting review in Supabase:', error);
      } else if (productId) {
        // Recalculate product rating after deletion
        await recalculateProductRating(productId);
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review_text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredReviews.length} of {reviews.length} reviews</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer, product, or review text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value as any)}
            className="bg-card/50 text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
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

      {filteredReviews.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className="glass-card rounded-2xl p-5 border border-border transition-all"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm">
                    {review.user_name || 'Anonymous'}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">{review.user_email}</p>
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

              <div className="mb-3">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Package className="h-3 w-3" /> Product
                </span>
                <p className="font-bold text-primary text-xs mt-0.5 leading-snug line-clamp-1">
                  {review.product_title}
                </p>
              </div>

              <div className="mb-4 bg-background/40 p-3 rounded-xl border border-border">
                <p className="text-muted-foreground text-xs italic leading-relaxed line-clamp-3">
                  "{review.review_text}"
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-border text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={updatingId === review.id}
                    onClick={() => handleDelete(review.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
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
