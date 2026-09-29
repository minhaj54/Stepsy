export interface FeaturedBrand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export const featuredBrands: FeaturedBrand[] = [
  {
    id: 'fb-bata',
    name: 'Bata',
    slug: 'bata',
    logo: '/brands/bata.png',
  },
  {
    id: 'fb-redtape',
    name: 'RedTape',
    slug: 'red-tape',
    logo: '/brands/redtape.png',
  },
  {
    id: 'fb-campus',
    name: 'Campus',
    slug: 'campus',
    logo: '/brands/campus.png',
  },
  {
    id: 'fb-asian',
    name: 'Asian',
    slug: 'asian',
    logo: '/brands/asian.jpg',
  },
];
