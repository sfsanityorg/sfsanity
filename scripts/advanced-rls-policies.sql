-- Advanced RLS Policies for Enhanced Security
-- Run this script after the main table creation script

-- Drop existing policies if you want to replace them
-- DROP POLICY IF EXISTS "Allow public read access" ON public.items;

-- 1. Time-based access policy (items are only visible during business hours)
CREATE POLICY "Business hours access only" ON public.items
  FOR SELECT 
  USING (
    EXTRACT(hour FROM NOW() AT TIME ZONE 'UTC') BETWEEN 8 AND 18
    OR auth.role() = 'authenticated'
  );

-- 2. Status-based visibility (only show active items to anonymous users)
CREATE POLICY "Anonymous users see active items only" ON public.items
  FOR SELECT 
  USING (
    CASE 
      WHEN auth.role() = 'anon' THEN status = 'active'
      ELSE true
    END
  );

-- 3. Rate limiting policy (prevent excessive queries)
-- Note: This requires a separate rate limiting table
CREATE TABLE IF NOT EXISTS public.user_rate_limits (
  user_id UUID,
  ip_address INET,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(ip_address, '0.0.0.0'::INET))
);

-- Enable RLS on rate limiting table
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- 4. Audit trail for sensitive operations
CREATE TABLE IF NOT EXISTS public.items_audit (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES public.items(id),
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.items_audit ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own audit records
CREATE POLICY "Users can view own audit records" ON public.items_audit
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can view all audit records
CREATE POLICY "Service role can view all audit records" ON public.items_audit
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_items_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.items_audit (
    item_id,
    operation,
    old_values,
    new_values,
    user_id,
    created_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER items_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.items
  FOR EACH ROW EXECUTE FUNCTION audit_items_changes();
