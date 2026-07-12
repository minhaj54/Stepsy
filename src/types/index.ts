export interface ProductVariant {
  id: string;
  product_id: string;
  size: string; // e.g., "7", "8", "9", "10", "11", "12"
  color: string; // e.g., "Triple Black", "Varsity Red", "Core White"
  stock_quantity: number;
}

export interface Product {
  id: string;
  brand_id: string;
  brand_name: string;
  category_id: string;
  category_slug: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  images: string[];
  variants: ProductVariant[];
  rating: number; // average rating
  reviews_count: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  specifications?: Record<string, string>;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  image?: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  product_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  images?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  published_at: string;
  read_time: string;
  category: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  total_amount: number;
  shipping_address: ShippingAddress;
  items: {
    product_id: string;
    product_title: string;
    product_image: string;
    variant_id: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  created_at: string;
}
