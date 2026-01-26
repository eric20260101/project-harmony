-- Drop the existing policy
DROP POLICY "Members can add workspace members" ON public.workspace_members;

-- Create new policy that allows:
-- 1. Workspace creators to add themselves as the first member
-- 2. Existing members to add other members
CREATE POLICY "Users can add workspace members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow workspace creator to add themselves
  (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE id = workspace_id AND created_by = auth.uid()
  ))
  OR
  -- Allow existing members to add others
  is_workspace_member(auth.uid(), workspace_id)
);