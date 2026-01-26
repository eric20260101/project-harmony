-- Remove foreign key constraint on workspace_members.user_id to allow demo team members
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;