import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTestimonials } from '../../../lib/data/products';
import TestimonialsClient from './TestimonialsClient';

export const metadata = {
  title: 'Testimonials - Super Admin',
};

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();
  return <TestimonialsClient initialTestimonials={testimonials} />;
}
