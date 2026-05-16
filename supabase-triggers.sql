-- Auto-assign free plan to new users
-- Run this in your Supabase SQL Editor

-- First, ensure the plan column exists and has a default
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB DEFAULT '{}';

-- Create a function to assign free plan
CREATE OR REPLACE FUNCTION public.assign_free_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Set free plan in user metadata
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{plan}',
    '"free"',
    true
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_free_plan();

-- Update existing users to free plan (run once)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{plan}',
  '"free"',
  true
)
WHERE raw_user_meta_data->>'plan' IS NULL;
