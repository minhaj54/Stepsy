import React from 'react';
import { getAllUsers, updateUserRole } from '../../../lib/data/products';
import AdminUsersClient from './AdminUsersClient';

export const metadata = {
  title: 'Users Management - Super Admin',
};

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return <AdminUsersClient initialUsers={users} />;
}
