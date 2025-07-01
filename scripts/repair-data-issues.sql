-- Data Repair Script
-- Run this to fix common data validation issues

-- 1. Fix null or empty names
UPDATE public.items 
SET name = 'Item #' || id::text 
WHERE name IS NULL OR name = '' OR trim(name) = '';

-- 2. Fix invalid status values
UPDATE public.items 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'pending');

-- 3. Fix date format issues (if any)
-- This assumes created_at might have invalid formats
UPDATE public.items 
SET created_at = NOW()
WHERE created_at IS NULL;

-- 4. Clean up description field
UPDATE public.items 
SET description = NULL 
WHERE description = '' OR trim(description) = '';

-- 5. Ensure all required fields have values
UPDATE public.items 
SET 
  name = COALESCE(NULLIF(trim(name), ''), 'Item #' || id::text),
  status = COALESCE(status, 'active'),
  created_at = COALESCE(created_at, NOW())
WHERE id IS NOT NULL;

-- 6. Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at);

-- 7. Verify repairs
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as items_with_empty_names,
  COUNT(CASE WHEN status NOT IN ('active', 'inactive', 'pending') THEN 1 END) as items_with_invalid_status,
  COUNT(CASE WHEN created_at IS NULL THEN 1 END) as items_with_null_created_at
FROM public.items;

-- 8. Show sample of repaired data
SELECT 
  id,
  name,
  status,
  created_at,
  description
FROM public.items 
ORDER BY id 
LIMIT 5;
