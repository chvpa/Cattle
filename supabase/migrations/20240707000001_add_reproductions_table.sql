-- Create reproductions table
CREATE TABLE IF NOT EXISTS reproductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mother_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  father_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  service_method TEXT NOT NULL,
  service_date DATE NOT NULL,
  expected_birth_date DATE NOT NULL,
  actual_birth_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add realtime support
alter publication supabase_realtime add table reproductions;
