-- Fix the infinite recursion issue by using a SECURITY DEFINER function for hospital staff check
-- and add INSERT policies for the signup flow

-- Create a helper function to check hospital staff without recursion
CREATE OR REPLACE FUNCTION public.is_hospital_staff(_user_id uuid, _hospital_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hospital_staff
    WHERE user_id = _user_id
      AND hospital_id = _hospital_id
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Hospital staff can view their hospital" ON public.hospitals;
DROP POLICY IF EXISTS "Staff can view their own hospital staff" ON public.hospital_staff;
DROP POLICY IF EXISTS "Hospital staff can view their subscription" ON public.hospital_subscriptions;
DROP POLICY IF EXISTS "Hospital staff can view access logs for their hospital" ON public.hospital_patient_access_logs;
DROP POLICY IF EXISTS "Hospital staff can insert access logs" ON public.hospital_patient_access_logs;

-- Add INSERT policy for hospitals (needed during signup)
CREATE POLICY "Authenticated users can create hospitals"
ON public.hospitals
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add INSERT policy for hospital_staff (needed to link admin to hospital during signup)
CREATE POLICY "Authenticated users can create staff link"
ON public.hospital_staff
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for hospital_subscriptions (needed during signup)
CREATE POLICY "Authenticated users can create subscriptions"
ON public.hospital_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add INSERT policy for user_roles (needed during signup)
CREATE POLICY "Authenticated users can create their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate SELECT policies using the SECURITY DEFINER function
CREATE POLICY "Hospital staff can view their hospital"
ON public.hospitals
FOR SELECT
TO authenticated
USING (public.is_hospital_staff(auth.uid(), id));

CREATE POLICY "Staff can view their own hospital staff"
ON public.hospital_staff
FOR SELECT
TO authenticated
USING (public.is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Hospital staff can view their subscription"
ON public.hospital_subscriptions
FOR SELECT
TO authenticated
USING (public.is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Hospital staff can view access logs for their hospital"
ON public.hospital_patient_access_logs
FOR SELECT
TO authenticated
USING (public.is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Hospital staff can insert access logs"
ON public.hospital_patient_access_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_hospital_staff(auth.uid(), hospital_id));