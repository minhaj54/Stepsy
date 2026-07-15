import React from 'react';
import { getHomeBanner } from '../../../lib/data/products';
import AdminBannersClient from './AdminBannersClient';

export const metadata = {
  title: 'Banners Management - Super Admin',
};

export default async function AdminBannersPage() {
  const banner = await getHomeBanner();

  return <AdminBannersClient initialBanner={banner} />;
}
