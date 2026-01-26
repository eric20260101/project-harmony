-- Remove foreign key constraint on profiles to allow demo team members
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make user_id not require a real auth.users entry (for demo purposes)
-- The RLS policies will still protect data appropriately
