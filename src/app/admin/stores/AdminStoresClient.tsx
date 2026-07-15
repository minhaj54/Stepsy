'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Store as StoreIcon, ExternalLink, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminStoresClientProps {
  initialStores: any[];
}

export default function AdminStoresClient({ initialStores }: AdminStoresClientProps) {
  const [stores, setStores] = useState<any[]>(initialStores);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const configured = isSupabaseConfigured();

  const handleStatusChange = async (storeId: string, newStatus: string) => {
    setUpdatingId(storeId);
    
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, status: newStatus } : s))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('stores')
        .update({ status: newStatus })
        .eq('id', storeId);

      if (error) {
        console.error('Error updating store status in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'suspended': return XCircle;
      default: return Eye;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Stores Management</h1>
        <p className="text-zinc-400 text-sm mt-1">{filteredStores.length} of {stores.length} stores</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by store name or owner..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <StoreIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No stores found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            const StatusIcon = getStatusIcon(store.status);
            return (
              <div key={store.id} className="glass-card rounded-2xl overflow-hidden">
                {/* Store Banner */}
                <div className="h-32 w-full bg-zinc-900 relative overflow-hidden">
                  {store.banner_url ? (
                    <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(store.status)}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {store.status}
                    </span>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/[0.06] shrink-0">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <StoreIcon className="h-6 w-6 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{store.name}</h3>
                      <p className="text-xs text-zinc-500">by {store.users?.full_name || 'Unknown'}</p>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{store.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/store/${store.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg px-3 py-2 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Link>
                    {store.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'active')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}
                    {store.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'suspended')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Suspend
                      </button>
                    )}
                    {store.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'active')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
