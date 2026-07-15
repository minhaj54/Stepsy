'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Shield, User, Mail, Phone, Calendar, MoreHorizontal, Edit, Crown } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminCustomersClientProps {
  initialCustomers: any[];
}

export default function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'vendor'>('all');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  
  const configured = isSupabaseConfigured();

  const handleRoleChange = async (customerId: string, newRole: string) => {
    setEditingRole(customerId);
    
    setCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, role: newRole } : c))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', customerId);

      if (error) {
        console.error('Error updating user role in Supabase:', error);
      }
    }

    setEditingRole(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-accent/10 text-accent border-accent/20';
      case 'vendor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'customer': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'vendor': return Shield;
      case 'customer': return User;
      default: return User;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Customers</h1>
          <p className="text-zinc-400 text-sm mt-1">{filteredCustomers.length} of {customers.length} registered users</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="vendor">Vendors</option>
          </select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/[0.05]">
          <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No customers found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const RoleIcon = getRoleIcon(customer.role);
            return (
              <div key={customer.id} className="glass-card rounded-2xl p-6 border border-white/[0.05] hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{customer.full_name || 'Unknown'}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 ${getRoleColor(customer.role)}`}>
                        <RoleIcon className="h-3 w-3" />
                        {customer.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <p className="text-zinc-400 truncate">{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      <p className="text-zinc-400">{customer.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <p className="text-zinc-400">
                      Joined {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Change Role</label>
                  <select
                    disabled={editingRole === customer.id}
                    value={customer.role}
                    onChange={e => handleRoleChange(customer.id, e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] text-white rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
