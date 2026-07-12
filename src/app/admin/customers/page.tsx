import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdminCustomers } from '../../../lib/data/products';

export const metadata = {
  title: 'Customers - Stepzy Admin',
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Customers</h1>
        <p className="text-zinc-400 text-sm mt-1">{customers.length} registered users</p>
      </div>

      {customers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-zinc-400">No customers yet. Users will appear here after signing up.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Phone</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-semibold text-white">{customer.full_name || '—'}</td>
                    <td className="p-4 text-zinc-400">{customer.email}</td>
                    <td className="p-4 text-zinc-400">{customer.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        customer.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-xs">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
