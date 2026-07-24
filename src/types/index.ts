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
  store_id?: string;
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

export interface SocialHandle {
  platform: string; // e.g., "instagram", "facebook", "twitter", "youtube"
  handle: string;    // e.g., "zarwinto"
  url?: string;      // optional full URL
}

export interface PickupAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  landmark?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  banner_url: string;
  logo_url: string;
  social_handle: string;
  social_handles?: SocialHandle[];
  customer_support_phone?: string;
  government_id_url?: string;
  government_id_type?: string;
  pickup_address?: PickupAddress;
  pickup_pincode?: string;
  pickup_city?: string;
  pickup_state?: string;
  gst_number?: string;
  business_name?: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
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
  approved?: boolean;
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
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'cod_pending';
  payment_method: 'prepaid' | 'cod' | 'cashfree_upi' | 'cashfree_card' | 'cashfree_netbanking';
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
  shiprocket_order_id?: number;
  awb_code?: string;
  courier_name?: string;
  shipment_id?: number;
  // Cashfree payment fields
  cashfree_order_id?: string;
  cashfree_payment_id?: string;
  cashfree_payment_status?: string;
  cashfree_payment_method?: string;
  cashfree_payment_message?: string;
  cashfree_webhook_received?: boolean;
}
