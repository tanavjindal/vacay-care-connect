-- Drop and recreate the policy to ensure it's properly applied
DROP POLICY IF EXISTS "Authenticated users can create hospitals" ON public.hospitals;

-- Add policy that explicitly allows any authenticated user to insert
CREATE POLICY "Allow hospital creation"
ON public.hospitals
FOR INSERT
TO authenticated
WITH CHECK (true);