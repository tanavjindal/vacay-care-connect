-- Tighten the INSERT policies for hospitals and subscriptions
-- These are controlled through the signup flow where we verify the hospital is being created
-- along with the staff link in a transaction

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON public.hospital_subscriptions;

-- Create a more restrictive policy for hospitals
-- Users can only create a hospital if they don't already belong to one
CREATE POLICY "Authenticated users can create hospitals once"
ON public.hospitals
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.hospital_staff 
    WHERE user_id = auth.uid()
  )
);

-- For subscriptions, they must be linked to a hospital the user is staff of
CREATE POLICY "Hospital staff can create subscription for their hospital"
ON public.hospital_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hospital_staff
    WHERE hospital_id = hospital_subscriptions.hospital_id
      AND user_id = auth.uid()
      AND is_admin = true
  )
);