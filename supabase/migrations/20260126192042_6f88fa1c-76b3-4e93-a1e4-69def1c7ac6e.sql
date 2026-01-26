-- Fix: workspaces INSERT policy is restrictive, which can block all inserts.
-- Convert it to a permissive policy.

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
