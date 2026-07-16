import React from 'react';
import { getAdminOrders } from '../../../lib/data/products';
import AdminOrdersClient from './AdminOrdersClient';

export const metadata = {
  title: 'Manage Orders - Zarwinto Admin',
};

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return <AdminOrdersClient initialOrders={orders} />;
}
