import React from 'react';
import Link from 'next/link';
import { getAdminCustomers } from '../../../lib/data/products';
import AdminCustomersClient from './AdminCustomersClient';

export const metadata = {
  title: 'Customers - Zarwinto Admin',
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return <AdminCustomersClient initialCustomers={customers} />;
}
