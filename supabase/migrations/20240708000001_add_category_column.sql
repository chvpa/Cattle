-- Add category column to animals table
ALTER TABLE animals ADD COLUMN IF NOT EXISTS category TEXT;
