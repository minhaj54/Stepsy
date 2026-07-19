# Zarwinto - Marketplace Infrastructure Blueprint

## Vision

Build a footwear-focused ecosystem in phases:

1. Multi-brand footwear store
2. Content & community platform
3. Vendor marketplace
4. Footwear ecosystem
5. Private-label brand

---

# Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Supabase (for ALL backend services)
  - PostgreSQL Database
  - Authentication
  - Storage
  - Edge Functions
  - Row Level Security (RLS)
  - Realtime (optional)

## Payments
- Razorpay

## Deployment
- Vercel

## Analytics
- Google Analytics
- Microsoft Clarity

---

# Phase 1: Multi-Brand Footwear Store (MVP)

## Goal

Launch a working e-commerce store where only the platform owner sells products.

---

## Public Pages

### Home Page

Sections:
- Hero Banner
- Featured Products
- New Arrivals
- Best Sellers
- Categories
- Customer Reviews
- Newsletter Signup

---

### Category Pages

Examples:
- Boots
- Sneakers
- Casual Shoes
- Formal Shoes
- Sandals

Features:
- Filters
- Sorting
- Pagination

---

### Product Detail Page

Features:
- Images Gallery
- Product Description
- Specifications
- Available Sizes
- Stock Status
- Reviews
- Related Products

---

### Search Page

Features:
- Keyword Search
- Category Search
- Brand Search

---

### Cart

Features:
- Update Quantity
- Remove Item
- Apply Coupon

---

### Checkout

Features:
- Address Selection
- Payment Method
- Order Summary

---

### Customer Account

Features:
- Profile
- Orders
- Wishlist
- Saved Addresses

---

# Database Design (Supabase)

## users

Columns:

- id
- full_name
- email
- phone
- role
- created_at

Role values:

- customer
- admin
- vendor

---

## brands

- id
- name
- slug
- logo
- description

---

## categories

- id
- name
- slug
- parent_id

---

## products

- id
- brand_id
- category_id
- title
- slug
- description
- price
- sale_price
- sku
- status
- created_at

---

## product_images

- id
- product_id
- image_url
- sort_order

---

## product_variants

- id
- product_id
- size
- color
- stock_quantity

---

## orders

- id
- user_id
- status
- payment_status
- total_amount
- created_at

---

## order_items

- id
- order_id
- product_id
- variant_id
- quantity
- price

---

## addresses

- id
- user_id
- full_name
- phone
- address_line1
- city
- state
- pincode

---

## reviews

- id
- user_id
- product_id
- rating
- review_text

---

## wishlist

- id
- user_id
- product_id

---

# Authentication

Use Supabase Auth.

Features:

- Email Signup
- Email Login
- Google Login
- Password Reset

---

# Storage

Use Supabase Storage.

Buckets:

## products

Store:
- Product Images
- Product Videos

## reviews

Store:
- Customer Uploaded Images

---

# Admin Dashboard

## Dashboard Metrics

- Revenue
- Orders
- Customers
- Products

---

## Product Management

Admin can:

- Create Product
- Edit Product
- Delete Product
- Manage Inventory

---

## Order Management

Admin can:

- View Orders
- Update Status
- Process Returns

---

## Customer Management

Admin can:

- View Customers
- View Order History

---

# SEO Requirements

Every page should support:

- Meta Title
- Meta Description
- Open Graph Tags
- Canonical URLs
- Structured Data

---

# Content Engine

## Blog

Tables:

### blog_posts

- id
- title
- slug
- content
- featured_image
- published_at

---

Blog Features:

- Categories
- Tags
- Search
- Related Articles

---

# Review System

Customers can:

- Rate Product
- Upload Images
- Write Reviews

Admin can:

- Approve Reviews
- Remove Reviews

---

# Wishlist System

Users can:

- Save Products
- Move to Cart

---

# Coupon System

Tables:

## coupons

- id
- code
- type
- value
- start_date
- end_date

---

# Notifications

Use:

- Email Notifications
- Order Confirmation
- Shipping Updates

---

# Phase 2: Marketplace Foundation

Do NOT activate initially.

Build architecture now.

---

## vendors

- id
- user_id
- store_name
- store_slug
- description
- status

---

## vendor_products

- id
- vendor_id
- product_id

---

## vendor_payouts

- id
- vendor_id
- amount
- status

---

# Vendor Dashboard

Future Features:

- Add Products
- Manage Inventory
- View Orders
- View Earnings
- Request Payout

---

# Marketplace Commission Engine

Admin Settings:

- Commission Percentage
- Vendor Fee

Order Flow:

Customer Purchase
→ Platform Receives Payment
→ Commission Deducted
→ Vendor Receives Payout

---

# Vendor Approval Workflow

Vendor Applies
→ Admin Review
→ Approved
→ Can List Products

---

# Phase 3: Footwear Ecosystem

## Brand Profiles

Each Brand Gets:

- Brand Story
- Brand Catalog
- Reviews

---

## Manufacturer Directory

Tables:

### manufacturers

- id
- company_name
- city
- state
- contact_details

---

# Wholesale Marketplace

Features:

- MOQ Support
- Bulk Pricing
- RFQ Requests

---

# Analytics

## Customer Analytics

Track:

- Conversion Rate
- AOV
- Repeat Purchases

---

## Product Analytics

Track:

- Top Sellers
- Most Viewed Products
- Low Inventory Products

---

# Security

Implement:

- Supabase RLS
- Protected Routes
- Input Validation
- Rate Limiting

---

# Performance Requirements

Target:

- Lighthouse > 90
- Mobile First
- Image Optimization
- Server Components

---

# Cursor AI Build Instructions

Build this project in phases.

Phase 1 must be production-ready before starting Phase 2.

Priority Order:

1. Authentication
2. Database Schema
3. Product Catalog
4. Cart
5. Checkout
6. Orders
7. Admin Dashboard
8. Reviews
9. Blog
10. SEO
11. Vendor Architecture
12. Marketplace Features

Never build marketplace-specific UI before the MVP store is fully functional.

The codebase should be modular and marketplace-ready from day one.
