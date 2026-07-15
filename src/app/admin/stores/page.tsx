import React from 'react';
import { getAllStores, updateStoreStatus } from '../../../lib/data/stores';
import AdminStoresClient from './AdminStoresClient';

export const metadata = {
  title: 'Stores Management - Super Admin',
};

export default async function AdminStoresPage() {
  const stores = await getAllStores();

  return <AdminStoresClient initialStores={stores} />;
}
