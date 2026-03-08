
-- Block direct subscription creation - handled by register_hospital function
DROP POLICY IF EXISTS "Hospital admins can create subscription" ON public.hospital_subscriptions;

CREATE POLICY "No direct subscription creation" ON public.hospital_subscriptions FOR INSERT TO authenticated
  WITH CHECK (false);
