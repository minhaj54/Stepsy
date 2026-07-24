import { Product, Brand, Category, BlogPost, Review, Store } from '../types';

export const mockBrands: Brand[] = [
  {
    id: 'b1',
    name: 'AeroStride',
    slug: 'aerostride',
    logo: '⚡',
    description: 'Cutting-edge athletic and running performance footwear designed for speed and comfort.',
    featured: true
  },
  {
    id: 'b2',
    name: 'ApexCraft',
    slug: 'apexcraft',
    logo: '👑',
    description: 'Handcrafted luxury leather shoes, boots, and loafers designed with timeless elegance.',
    featured: true
  },
  {
    id: 'b3',
    name: 'TerraTrek',
    slug: 'terratrek',
    logo: '⛰️',
    description: 'Rugged, all-weather boots and trail shoes built to endure the elements.',
    featured: true
  },
  {
    id: 'b4',
    name: 'CloudWalk',
    slug: 'cloudwalk',
    logo: '☁️',
    description: 'Ultra-cushioned lifestyle slides, sandals, and casual slip-ons.',
    featured: false
  }
];

export const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Sneakers',
    slug: 'sneakers',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'c2',
    name: 'Casual Shoes',
    slug: 'casual',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'c3',
    name: 'Boots',
    slug: 'boots',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'c4',
    name: 'Formal Shoes',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'c5',
    name: 'Sandals',
    slug: 'sandals',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    brand_id: 'b1',
    store_id: 's1',
    brand_name: 'AeroStride',
    category_id: 'c1',
    category_slug: 'sneakers',
    title: 'Volt Velocity runner v4',
    slug: 'volt-velocity-runner-v4',
    description: 'Engineered for speed, the Volt Velocity Runner v4 features a responsive carbon fiber plate and our proprietary nitrogen-infused foam midsole. Its breathable warp-knit upper hugs the foot like a second skin, providing strategic stability for both sprint training and long-distance marathons.',
    price: 129,
    sale_price: 99,
    sku: 'AS-VOLT-V4-001',
    status: 'active',
    created_at: '2026-05-01T08:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 142,
    featured: true,
    newArrival: true,
    bestSeller: false,
    specifications: {
      'Weight': '8.2 oz / 232g (Size 9)',
      'Midsole': 'NitroFoam Elite with Carbon Plate',
      'Drop': '8mm',
      'Upper': 'HyperWarp Engineered Mesh',
      'Outsole': 'GripTraction High-Abrasion Rubber'
    },
    variants: [
      { id: 'v1_1', product_id: 'p1', size: '8', color: 'Volt Electric', stock_quantity: 12 },
      { id: 'v1_2', product_id: 'p1', size: '9', color: 'Volt Electric', stock_quantity: 24 },
      { id: 'v1_3', product_id: 'p1', size: '10', color: 'Volt Electric', stock_quantity: 18 },
      { id: 'v1_4', product_id: 'p1', size: '11', color: 'Volt Electric', stock_quantity: 5 },
      { id: 'v1_5', product_id: 'p1', size: '9', color: 'Cyber Pink', stock_quantity: 8 },
      { id: 'v1_6', product_id: 'p1', size: '10', color: 'Cyber Pink', stock_quantity: 14 }
    ]
  },
  {
    id: 'p2',
    brand_id: 'b2',
    store_id: 's1',
    brand_name: 'ApexCraft',
    category_id: 'c2',
    category_slug: 'casual',
    title: 'Midnight Stealth Leather',
    slug: 'midnight-stealth-leather',
    description: 'Constructed from full-grain Italian calfskin leather, the Midnight Stealth combines the luxurious texture of custom footwear with an athletic ortholite sole. Finished with hand-waxed cotton laces and a subtle embossed logo at the heel, it transitions effortlessly from boardrooms to upscale evening dinners.',
    price: 169,
    sku: 'AC-MNS-LTH-002',
    status: 'active',
    created_at: '2026-05-10T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 89,
    featured: true,
    newArrival: false,
    bestSeller: true,
    specifications: {
      'Material': 'Full-grain Italian Calfskin Leather',
      'Lining': 'Breathable Sheepskin Leather',
      'Insole': 'Ortholite Comfort Foam',
      'Outsole': 'Margom Italian Rubber Cupsole'
    },
    variants: [
      { id: 'v2_1', product_id: 'p2', size: '8', color: 'Stealth Black', stock_quantity: 15 },
      { id: 'v2_2', product_id: 'p2', size: '9', color: 'Stealth Black', stock_quantity: 20 },
      { id: 'v2_3', product_id: 'p2', size: '10', color: 'Stealth Black', stock_quantity: 35 },
      { id: 'v2_4', product_id: 'p2', size: '11', color: 'Stealth Black', stock_quantity: 12 },
      { id: 'v2_5', product_id: 'p2', size: '9', color: 'Mocha Tan', stock_quantity: 7 },
      { id: 'v2_6', product_id: 'p2', size: '10', color: 'Mocha Tan', stock_quantity: 15 }
    ]
  },
  {
    id: 'p3',
    brand_id: 'b1',
    store_id: 's1',
    brand_name: 'AeroStride',
    category_id: 'c1',
    category_slug: 'sneakers',
    title: 'Retro Crimson Court High-Top',
    slug: 'retro-crimson-court-hightop',
    description: 'Inspired by the high-flying legends of 80s hardwood, this retro high-top blends classic styling with modern cushioning. The premium leather upper features contrasting crimson and white panels, while the padded collar and mesh tongue offer a snug, soft fit all day long.',
    price: 189,
    sale_price: 149,
    sku: 'AS-RCH-TOP-003',
    status: 'active',
    created_at: '2026-05-15T12:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 211,
    featured: true,
    newArrival: true,
    bestSeller: true,
    specifications: {
      'Material': 'Genuine Leather and Suede Panel overlays',
      'Ankle': 'Padded High-Top Collar for Support',
      'Midsole': 'Encapsulated Air-Sole Unit',
      'Outsole': 'Herringbone Pattern Durable Rubber'
    },
    variants: [
      { id: 'v3_1', product_id: 'p3', size: '8', color: 'Varsity Red/White', stock_quantity: 9 },
      { id: 'v3_2', product_id: 'p3', size: '9', color: 'Varsity Red/White', stock_quantity: 14 },
      { id: 'v3_3', product_id: 'p3', size: '10', color: 'Varsity Red/White', stock_quantity: 22 },
      { id: 'v3_4', product_id: 'p3', size: '11', color: 'Varsity Red/White', stock_quantity: 10 },
      { id: 'v3_5', product_id: 'p3', size: '12', color: 'Varsity Red/White', stock_quantity: 4 }
    ]
  },
  {
    id: 'p4',
    brand_id: 'b3',
    brand_name: 'TerraTrek',
    category_id: 'c3',
    category_slug: 'boots',
    title: 'Urban Explorer Waterproof Boot',
    slug: 'urban-explorer-waterproof-boot',
    description: 'Prepare for any weather. The Urban Explorer is constructed with seam-sealed waterproof nubuck leather and lined with a breathable thermal barrier to regulate temperature. A rugged Vibram outsole offers superior grip on slippery city pavements or loose hiking trails.',
    price: 219,
    sku: 'TT-UXW-BOT-004',
    status: 'active',
    created_at: '2026-04-20T09:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 67,
    featured: false,
    newArrival: false,
    bestSeller: false,
    specifications: {
      'Waterproofing': 'Seam-sealed Hydrophobic Treatment',
      'Leather': 'Water-Resistant Premium Nubuck',
      'Outsole': 'Vibram MegaGrip Rubber Outsole',
      'Hardware': 'Rustproof Speed Lacing Eyelets'
    },
    variants: [
      { id: 'v4_1', product_id: 'p4', size: '8', color: 'Sahara Sand', stock_quantity: 11 },
      { id: 'v4_2', product_id: 'p4', size: '9', color: 'Sahara Sand', stock_quantity: 18 },
      { id: 'v4_3', product_id: 'p4', size: '10', color: 'Sahara Sand', stock_quantity: 25 },
      { id: 'v4_4', product_id: 'p4', size: '11', color: 'Sahara Sand', stock_quantity: 19 },
      { id: 'v4_5', product_id: 'p4', size: '12', color: 'Sahara Sand', stock_quantity: 8 }
    ]
  },
  {
    id: 'p5',
    brand_id: 'b2',
    brand_name: 'ApexCraft',
    category_id: 'c4',
    category_slug: 'formal',
    title: 'Aero Luxe Wingtip Brogues',
    slug: 'aero-luxe-wingtip-brogues',
    description: 'Masterfully built, the Aero Luxe features classic wingtip perforation patterns along with a hand-burnished mahogany finish. A double-leather Goodyear welted construction ensures this shoe can be resoled for decades, while a cork fill underfoot molds to the unique contours of your foot.',
    price: 249,
    sku: 'AC-ALW-BRG-005',
    status: 'active',
    created_at: '2026-05-18T15:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614252329309-de466b039401?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 42,
    featured: true,
    newArrival: true,
    bestSeller: false,
    specifications: {
      'Construction': 'Goodyear Welted (360 Degree)',
      'Upper Leather': 'French Calfskin Sourced from Annonay',
      'Footbed': 'Natural Cork Fill with Steel Shank',
      'Resolable': 'Yes'
    },
    variants: [
      { id: 'v5_1', product_id: 'p5', size: '8', color: 'Burnished Mahogany', stock_quantity: 5 },
      { id: 'v5_2', product_id: 'p5', size: '9', color: 'Burnished Mahogany', stock_quantity: 10 },
      { id: 'v5_3', product_id: 'p5', size: '10', color: 'Burnished Mahogany', stock_quantity: 12 },
      { id: 'v5_4', product_id: 'p5', size: '11', color: 'Burnished Mahogany', stock_quantity: 7 }
    ]
  },
  {
    id: 'p6',
    brand_id: 'b4',
    brand_name: 'CloudWalk',
    category_id: 'c5',
    category_slug: 'sandals',
    title: 'Pacific Breeze Comfort Slides',
    slug: 'pacific-breeze-comfort-slides',
    description: 'Designed for lazy beach days and post-workout recovery, the Pacific Breeze features an anatomically contoured footbed that cradles your foot. The dual-density EVA slide is water-friendly, lightweight, and features an adjustable strap to ensure a comfortable fit for any foot shape.',
    price: 49,
    sale_price: 39,
    sku: 'CW-PBC-SLD-006',
    status: 'active',
    created_at: '2026-05-20T11:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 124,
    featured: false,
    newArrival: false,
    bestSeller: true,
    specifications: {
      'Material': 'Dual-Density Lightweight EVA Foam',
      'Waterproof': '100% Water-Resistant & Floatability',
      'Strap': 'Adjustable Padded Velcro Strap',
      'Arch Support': 'Orthopedic Contour Support'
    },
    variants: [
      { id: 'v6_1', product_id: 'p6', size: '8', color: 'Navy Blue', stock_quantity: 30 },
      { id: 'v6_2', product_id: 'p6', size: '9', color: 'Navy Blue', stock_quantity: 45 },
      { id: 'v6_3', product_id: 'p6', size: '10', color: 'Navy Blue', stock_quantity: 50 },
      { id: 'v6_4', product_id: 'p6', size: '11', color: 'Navy Blue', stock_quantity: 25 },
      { id: 'v6_5', product_id: 'p6', size: '10', color: 'Off-White', stock_quantity: 20 }
    ]
  },
  {
    id: 'p7',
    brand_id: 'b1',
    brand_name: 'AeroStride',
    category_id: 'c1',
    category_slug: 'sneakers',
    title: 'CloudKnit Infinite Trainer',
    slug: 'cloudknit-infinite-trainer',
    description: 'Maximize your workout intensity. With a lightweight seamless knit upper and a high-energy return foam, the CloudKnit Infinite Trainer adapts dynamically as you lift, run, or jump. Side TPU wraps lock your heel down for lateral movements.',
    price: 139,
    sku: 'AS-CKI-TRN-007',
    status: 'active',
    created_at: '2026-05-25T07:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 98,
    featured: false,
    newArrival: true,
    bestSeller: false,
    specifications: {
      'Upper': 'Seamless CloudKnit Fabric',
      'Heel Stability': 'Molded TPU Counter Clip',
      'Midsole': 'AeroBounce Energy Returning Cushioning',
      'Versatility': 'Optimized for Crosstraining and HIIT'
    },
    variants: [
      { id: 'v7_1', product_id: 'p7', size: '8', color: 'Space Grey', stock_quantity: 14 },
      { id: 'v7_2', product_id: 'p7', size: '9', color: 'Space Grey', stock_quantity: 26 },
      { id: 'v7_3', product_id: 'p7', size: '10', color: 'Space Grey', stock_quantity: 30 },
      { id: 'v7_4', product_id: 'p7', size: '11', color: 'Space Grey', stock_quantity: 18 }
    ]
  },
  {
    id: 'p8',
    brand_id: 'b3',
    brand_name: 'TerraTrek',
    category_id: 'c3',
    category_slug: 'boots',
    title: 'Redwood Heritage Lug Boot',
    slug: 'redwood-heritage-lug-boot',
    description: 'Built to honour standard work boot designs, the Redwood Lug Boot is crafted from thick, oil-tanned harness leather that will develop a unique patina. Combined with a rugged lugged rubber outsole and classic brass speed hooks, this is a boot meant to last a lifetime.',
    price: 259,
    sale_price: 229,
    sku: 'TT-RHL-BOT-008',
    status: 'active',
    created_at: '2026-05-28T16:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviews_count: 53,
    featured: true,
    newArrival: false,
    bestSeller: false,
    specifications: {
      'Leather Type': 'Oil-Tanned Harness Leather',
      'Outsole': 'Vibram Commando Lugged Rubber',
      'Insole': 'Full Leather Footbed with Cork Filler',
      'Hardware': 'Solid Brass Eyelets and Speed Hooks'
    },
    variants: [
      { id: 'v8_1', product_id: 'p8', size: '8', color: 'Copper Rough & Tough', stock_quantity: 8 },
      { id: 'v8_2', product_id: 'p8', size: '9', color: 'Copper Rough & Tough', stock_quantity: 15 },
      { id: 'v8_3', product_id: 'p8', size: '10', color: 'Copper Rough & Tough', stock_quantity: 20 },
      { id: 'v8_4', product_id: 'p8', size: '11', color: 'Copper Rough & Tough', stock_quantity: 9 }
    ]
  }
];

export const mockStores: Store[] = [
  {
    id: 's1',
    owner_id: 'usr_demo',
    name: 'Zarwinto Flagship',
    slug: 'zarwinto-flagship',
    description: 'The official Zarwinto flagship store for premium footwear and sneakers.',
    banner_url: '',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',
    social_handle: '@zarwinto',
    social_handles: [
      { platform: 'instagram', handle: 'zarwinto', url: 'https://instagram.com/zarwinto' },
      { platform: 'facebook', handle: 'zarwinto', url: 'https://facebook.com/zarwinto' },
    ],
    customer_support_phone: '+91 98765 43210',
    government_id_url: '',
    government_id_type: '',
    pickup_address: {
      addressLine1: '123 Fashion Street, Shop No. 5',
      addressLine2: 'Near Central Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      landmark: 'Opposite Metro Station',
    },
    pickup_pincode: '400001',
    pickup_city: 'Mumbai',
    pickup_state: 'Maharashtra',
    gst_number: '27AABCT1234R1ZX',
    business_name: 'Zarwinto Retail Pvt. Ltd.',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

export const mockReviews: Record<string, Review[]> = {
  'p1': [
    {
      id: 'rev1_1',
      user_id: 'usr_1',
      user_name: 'Marcus Vance',
      user_avatar: '👨‍💻',
      product_id: 'p1',
      rating: 5,
      review_text: 'Absolutely phenomenal! The NitroFoam midsole gives so much energy return. Shaved a full minute off my 10k time on my first run in these. Highly recommend.',
      created_at: '2026-05-12T14:30:00Z'
    },
    {
      id: 'rev1_2',
      user_id: 'usr_2',
      user_name: 'Elena Rostova',
      user_avatar: '👩‍🎨',
      product_id: 'p1',
      rating: 4,
      review_text: 'Incredibly lightweight and fast. The mesh upper is very breathable. Runs slightly narrow, so maybe size up by half a size if you have wider feet.',
      created_at: '2026-05-20T09:15:00Z'
    }
  ],
  'p2': [
    {
      id: 'rev2_1',
      user_id: 'usr_3',
      user_name: 'Derrick Jenkins',
      user_avatar: '👨‍💼',
      product_id: 'p2',
      rating: 5,
      review_text: 'Bought these for office casual days. Leather is incredibly supple, zero break-in period. Got several compliments on the matte black look.',
      created_at: '2026-05-18T17:45:00Z'
    }
  ],
  'p3': [
    {
      id: 'rev3_1',
      user_id: 'usr_4',
      user_name: 'Kevin Hart',
      user_avatar: '👨‍🎤',
      product_id: 'p3',
      rating: 5,
      review_text: 'True classic retro sneaker! The quality of the leather is surprisingly good for the price. The ankle collar support is super comfy.',
      created_at: '2026-05-22T10:00:00Z'
    }
  ]
};

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post1',
    title: 'Sneaker Care 101: How to Keep Your Kicks Looking Brand New',
    slug: 'sneaker-care-101-keep-kicks-new',
    summary: 'A step-by-step professional guide to cleaning leather, suede, and knit sneakers, plus storing techniques to avoid oxidation.',
    content: 'Sneakers are more than just footwear; they are an investment and a form of self-expression. In this guide, we dive into the chemical properties of different materials and outline the absolute best techniques to clean and maintain them. We cover how to handle delicate suede without flattening the nap, how to safely wash knit shoes, and the best way to prevent your soles from yellowing over time.',
    featured_image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    published_at: '2026-05-25T12:00:00Z',
    read_time: '5 min read',
    category: 'Guide',
    tags: ['Sneaker Care', 'Maintenance', 'Sneakerheads']
  },
  {
    id: 'post2',
    title: 'The Rise of Technical Footwear in Modern Street Fashion',
    slug: 'rise-technical-footwear-street-fashion',
    summary: 'Explore how running shoes, hiking boots, and outdoor gear crossed over from trails and tracks to high-fashion runways.',
    content: 'Over the past decade, we have seen a dramatic shift. Performance footwear once reserved exclusively for marathons or mountain climbs is now commonplace at Fashion Weeks worldwide. We look at the rise of GORE-TEX hiking boots in urban centers and how brands like AeroStride and TerraTrek have redefined the silhouette of modern casual sneakers.',
    featured_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
    published_at: '2026-06-02T10:30:00Z',
    read_time: '7 min read',
    category: 'Fashion Trends',
    tags: ['Streetwear', 'Techwear', 'Gorpcore']
  }
];
