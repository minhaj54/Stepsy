import React from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, Store as StoreIcon, ArrowRight, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getAdminStats, getAdminOrders } from '../../lib/data/products';
import { getAllStores } from '../../lib/data/stores';
import { getCurrentUser } from '../../lib/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Super Admin Dashboard - Zarwinto',
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const recentOrders = await getAdminOrders();
  const stores = await getAllStores();
  const user = await getCurrentUser();

  const pendingStores = stores.filter(s => s.status === 'pending').length;
  const activeStores = stores.filter(s => s.status === 'active').length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <AdminDashboardClient 
        stats={stats} 
        recentOrders={recentOrders.slice(0, 5)} 
        totalStores={stores.length}
        activeStores={activeStores}
        pendingStores={pendingStores}
      />
    </div>
  );
}
