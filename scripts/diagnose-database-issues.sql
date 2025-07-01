-- Database Diagnostic Script
-- Run this to identify common data validation issues

-- 1. Check if items table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'items' AND table_schema = 'public';

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check for data type issues
SELECT 
  id,
  pg_typeof(id) as id_type,
  name,
  pg_typeof(name) as name_type,
  created_at,
  pg_typeof(created_at) as created_at_type,
  status,
  pg_typeof(status) as status_type
FROM public.items 
LIMIT 5;

-- 4. Check for null/empty values
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
  COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as null_or_empty_names,
  COUNT(CASE WHEN created_at IS NULL THEN 1 END) as null_created_at,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status
FROM public.items;

-- 5. Check for invalid status values
SELECT 
  status,
  COUNT(*) as count
FROM public.items 
GROUP BY status
ORDER BY count DESC;

-- 6. Check for date format issues
SELECT 
  id,
  created_at,
  updated_at,
  CASE 
    WHEN created_at::text ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}' THEN 'Valid ISO format'
    ELSE 'Invalid format'
  END as created_at_format
FROM public.items 
WHERE created_at IS NOT NULL
LIMIT 10;

-- 7. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'items';

-- 8. Test anonymous access
SET ROLE anon;
SELECT COUNT(*) as items_visible_to_anon FROM public.items;
RESET ROLE;

-- 9. Check for data length issues
SELECT 
  id,
  LENGTH(name) as name_length,
  LENGTH(description) as description_length
FROM public.items 
WHERE LENGTH(name) > 255 OR LENGTH(description) > 1000
LIMIT 5;

-- 10. Sample data for validation testing
SELECT 
  id,
  name,
  description,
  status,
  created_at,
  updated_at,
  created_by,
  updated_by
FROM public.items 
ORDER BY id 
LIMIT 3;
