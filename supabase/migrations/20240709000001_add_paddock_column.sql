-- Add paddock column to animals table
ALTER TABLE animals ADD COLUMN IF NOT EXISTS paddock TEXT;
