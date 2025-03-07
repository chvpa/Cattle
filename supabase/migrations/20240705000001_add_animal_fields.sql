-- Add new fields to animals table
ALTER TABLE public.animals
ADD COLUMN IF NOT EXISTS ear_tag text,
ADD COLUMN IF NOT EXISTS weight text,
ADD COLUMN IF NOT EXISTS owner text,
ADD COLUMN IF NOT EXISTS purpose text,
ADD COLUMN IF NOT EXISTS farm text;

-- Update realtime publication
alter publication supabase_realtime add table animals;