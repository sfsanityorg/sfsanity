-- Drop the table if it exists and recreate it
DROP TABLE IF EXISTS public.items;

-- Create the items table in the public schema
CREATE TABLE public.items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS) for the items table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- 1. Public read access policy (for anonymous users)
CREATE POLICY "Allow public read access" ON public.items
  FOR SELECT 
  USING (true);

-- 2. Authenticated users can insert items
CREATE POLICY "Allow authenticated users to insert" ON public.items
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Users can update their own items
CREATE POLICY "Allow users to update own items" ON public.items
  FOR UPDATE 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 4. Users can delete their own items
CREATE POLICY "Allow users to delete own items" ON public.items
  FOR DELETE 
  USING (auth.uid() = created_by);

-- 5. Service role can perform all operations (for admin functions)
CREATE POLICY "Allow service role full access" ON public.items
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_created_at ON public.items(created_at);
CREATE INDEX idx_items_created_by ON public.items(created_by);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (these will be owned by the service role)
INSERT INTO public.items (name, description, status) VALUES
  ('Welcome Dashboard', 'Your first item in the database', 'active'),
  ('Sample Product A', 'A sample product with detailed description', 'active'),
  ('Sample Product B', 'Another sample product for testing', 'inactive'),
  ('Test Item 1', 'Testing the database connection and display', 'active'),
  ('Test Item 2', 'Another test item with different status', 'pending'),
  ('Demo Content', 'Demonstration content for the frontend', 'active'),
  ('Sample Entry', 'Sample database entry for development', 'active'),
  ('Test Record', 'Test record with longer description to see how the UI handles overflow text content', 'active'),
  ('Development Item', 'Item created during development phase', 'inactive'),
  ('Production Ready', 'This item is ready for production use', 'active');

-- Grant necessary permissions
GRANT SELECT ON public.items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT USAGE ON SEQUENCE public.items_id_seq TO authenticated;
