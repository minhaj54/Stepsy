import React from 'react';
import { getAdminReviews } from '../../../lib/data/products';
import AdminReviewsClient from './AdminReviewsClient';

export const metadata = {
  title: 'Review Moderation - Zarwinto Admin',
};

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return <AdminReviewsClient initialReviews={reviews} />;
}
