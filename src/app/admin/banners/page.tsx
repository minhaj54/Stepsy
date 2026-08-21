import React from 'react';
import { getAdminBanners } from '../../../lib/data/adminBanners';
import AdminBannersClient from './AdminBannersClient';

export const metadata = {
  title: 'Banners Management - Super Admin',
};

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();

  return <AdminBannersClient initialBanners={banners} />;
}
