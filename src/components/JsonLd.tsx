'use client';

import { usePathname } from 'next/navigation';

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
  sameAs?: string[];
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  price: number;
  salePrice?: number;
  currency?: string;
  availability?: string;
  brand: string;
  category: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  author: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: {
    name: string;
    url: string;
  }[];
}

interface FaqSchemaProps {
  questions: {
    question: string;
    answer: string;
  }[];
}

export function OrganizationSchema({
  name = 'Zarwinto',
  description = 'Premium Footwear & Sneaker Marketplace - Discover elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.',
  url = 'https://zarwinto.com',
  logo = 'https://zarwinto.com/favicon.ico',
  contactPoint = {
    telephone: '+91-9876543210',
    contactType: 'customer service',
  },
  sameAs = [
    'https://www.facebook.com/zarwinto',
    'https://www.instagram.com/zarwinto',
    'https://twitter.com/zarwinto',
  ],
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    logo,
    contactPoint,
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zarwinto',
    description: 'Premium Footwear & Sneaker Marketplace',
    url: 'https://zarwinto.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://zarwinto.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  salePrice,
  currency = 'INR',
  availability = 'https://schema.org/InStock',
  brand,
  category,
  sku,
  rating,
  reviewCount,
  url,
}: ProductSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    offers: {
      '@type': 'Offer',
      price: salePrice || price,
      priceCurrency: currency,
      availability,
      url,
      seller: {
        '@type': 'Organization',
        name: 'Zarwinto',
      },
    },
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    category,
  };

  if (sku) {
    schema.sku = sku;
  }

  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  image,
  publishedAt,
  author,
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zarwinto',
      logo: {
        '@type': 'ImageObject',
        url: 'https://zarwinto.com/favicon.ico',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqSchema({ questions }: FaqSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ReviewSchema({
  reviews,
  itemReviewed,
}: {
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
  itemReviewed: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemReviewed,
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
