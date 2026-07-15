'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Shield, User, Mail, Phone, Calendar, Crown, Ban, CheckCircle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminUsersClientProps {
  initialUsers: any[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'vendor'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const configured = isSupabaseConfigured();

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    
    setUpdatingId(userId);
    
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: 'banned' } : u))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ role: 'banned' })
        .eq('id', userId);

      if (error) {
        console.error('Error banning user in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const handleUnbanUser = async (userId: string) => {
    setUpdatingId(userId);
    
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: 'customer' } : u))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ role: 'customer' })
        .eq('id', userId);

      if (error) {
        console.error('Error unbanning user in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-accent/10 text-accent border-accent/20';
      case 'vendor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'customer': return 'bg-primary/10 text-primary border-primary/20';
      case 'banned': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'vendor': return Shield;
      case 'customer': return User;
      case 'banned': return Ban;
      default: return User;
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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Users Management</h1>
        <p className="text-zinc-400 text-sm mt-1">{filteredUsers.length} of {users.length} registered users</p>
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
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <User className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No users found</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.full_name}</p>
                            <p className="text-xs text-zinc-500">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-zinc-300 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {user.email}
                          </p>
                          <p className="text-sm text-zinc-300 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            {user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(user.role)}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            disabled={updatingId === user.id}
                            className="bg-zinc-900 text-white border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary disabled:opacity-50"
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                          {user.role === 'banned' ? (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              disabled={updatingId === user.id}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                              title="Unban"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              disabled={updatingId === user.id}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                              title="Ban"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
