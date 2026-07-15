# Supabase Setup Instructions

Since Docker is not running locally, you need to apply migrations to your remote Supabase project.

## Step 1: Link to Remote Supabase

```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```

You can find your project ID in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

## Step 2: Apply All Migrations

```bash
npx supabase db push
```

This will apply all migrations including:
- Initial schema (001)
- Phone auth (002)
- User policies (003, 005, 008)
- Address policies (004)
- Orders policies (006)
- Storage bucket (007)

## Step 3: Verify Storage Bucket

After applying migrations, check that the `product-images` bucket exists in your Supabase dashboard:
1. Go to Storage in your Supabase dashboard
2. You should see a bucket named `product-images`
3. Make sure it's set to public

## Step 4: Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in your Supabase dashboard under Project Settings > API.

## Step 5: Test the Sync

1. Open browser console (F12)
2. Go to admin panel and add a product
3. Check console for:
   - "Supabase configured: true"
   - "Authenticated user: [user-id]"
   - "Product inserted successfully with ID: [id]"
4. Refresh the website homepage
5. Check console for:
   - "Fetched X products from Supabase"
   - Your new product should appear

## Troubleshooting

### If you see "Supabase not configured"
- Check your `.env.local` file exists and has the correct values
- Restart your dev server after updating env variables

### If you see authentication errors
- Make sure you're logged in as admin in the admin panel
- Check that your user has `role = 'admin'` in the `users` table

### If images fail to upload
- Make sure the `product-images` bucket exists (run migration 007)
- Check bucket is set to public
- Check storage policies allow authenticated users to upload

### If products don't show on frontend
- Check product status is 'active' (not 'draft' or 'archived')
- Check RLS policies allow public read for active products
- Check console for any errors when fetching products
