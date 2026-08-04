# Stepzy Mobile App Implementation Plan

The goal is to bring the Stepzy Flutter mobile app to parity with the Next.js website, ensuring all features are functional and data is correctly synchronized with Supabase.

## User Review Required

> [!IMPORTANT]
> The app currently uses a mix of mock data and Supabase fetching. We will prioritize Supabase data and ensure fallback to mock data only when necessary.
> The OTP verification flow in the app relies on a backend API endpoint (`/api/auth/send-otp` and `/api/auth/verify-otp`). We assume these endpoints are functional in the Next.js backend.

## Proposed Changes

### 1. Data Models & Store Refinement
- Ensure all models match the Supabase schema and include all fields used in the website (e.g., `featured`, `new_arrival`, `best_seller` in Products).
- Update `ZarwintoStore` to handle user profile data dynamically.

### 2. Home Screen (Parity with Website)
- [MODIFY] [home_tab.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/screens/home_tab.dart)
    - Replace hardcoded categories with dynamic categories from the store.
    - Implement a dynamic Hero Banner using the `banners` from the store.
    - Structure sections to match website: Featured Products, New Arrivals, Best Sellers.
    - Add a "Testimonials" section to match the website's social proof.
    - Use the logged-in user's name in the header.

### 3. Shop & Search
- [MODIFY] [shop_tab.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/screens/shop_tab.dart)
    - Ensure filtering and sorting work correctly with live data.
- [MODIFY] [search_screen.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/screens/search_screen.dart)
    - Implement real-time search fetching from Supabase.

### 4. Authentication Flow
- Ensure Signup, Signin, and OTP verification flows are fully functional and handle errors gracefully.
- Sync user state across the app.

### 5. Product Detail & Reviews
- [MODIFY] [product_detail.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/screens/product_detail.dart)
    - Implement "Related Products" section.
    - Implement "Customer Reviews" section fetching from Supabase.
    - Add ability to submit a review (if authenticated).

### 6. Cart & Checkout
- [MODIFY] [checkout_sheet.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/widgets/checkout_sheet.dart)
    - Ensure order placement correctly inserts records into `orders` and `order_items` tables in Supabase.
    - Implement payment integration placeholders (matching Razorpay from website).

### 7. User Account & Settings
- [MODIFY] [account_tab.dart](file:///Users/minhajraza/Desktop/Stepzy/mobile/stepzy_app/lib/screens/account_tab.dart)
    - Display order history.
    - Manage saved addresses.

## Verification Plan

### Automated Tests
- Run `flutter test` to ensure core logic and models are sound.

### Manual Verification
- Test Auth flow (Signup/Login/OTP).
- Verify data loading on Home and Shop screens.
- Add items to cart and complete checkout.
- Check "My Orders" after a successful purchase.
- Verify wishlist functionality persists.
