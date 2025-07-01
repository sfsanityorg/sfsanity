-- Security Validation Script
-- Run this to verify RLS policies are working correctly

-- 1. Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  forcerowsecurity as rls_forced
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname = 'public' 
  AND tablename IN ('items', 'items_audit', 'user_rate_limits');

-- 2. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Test anonymous access (should only see active items)
SET ROLE anon;
SELECT COUNT(*) as visible_items_count FROM public.items;
SELECT status, COUNT(*) FROM public.items GROUP BY status;

-- 4. Reset role
RESET ROLE;

-- 5. Verify table permissions
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'items'
ORDER BY grantee, privilege_type;

-- 6. Check for potential security issues
SELECT 
  'WARNING: Table without RLS' as issue,
  schemaname || '.' || tablename as table_name
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public' 
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE pg_policies.tablename = pg_tables.tablename
  );
