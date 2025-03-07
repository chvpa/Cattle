-- Add ear_tag column to animals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'ear_tag') THEN
    ALTER TABLE animals ADD COLUMN ear_tag VARCHAR DEFAULT 'red';
  END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'entry_date') THEN
    ALTER TABLE animals ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'weight') THEN
    ALTER TABLE animals ADD COLUMN weight VARCHAR;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'owner') THEN
    ALTER TABLE animals ADD COLUMN owner VARCHAR;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'purpose') THEN
    ALTER TABLE animals ADD COLUMN purpose VARCHAR DEFAULT 'fattening';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'farm') THEN
    ALTER TABLE animals ADD COLUMN farm VARCHAR;
  END IF;
END $$;