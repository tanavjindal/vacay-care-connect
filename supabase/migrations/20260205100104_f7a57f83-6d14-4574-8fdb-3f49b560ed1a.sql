-- Grant proper permissions to authenticated role for all tables
-- The RLS policies exist but the role needs base table permissions too

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospitals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_patient_access_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_medical_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Also grant to anon for public access where RLS allows
GRANT SELECT ON public.hospitals TO anon;
GRANT SELECT ON public.patients TO anon;
GRANT SELECT ON public.patient_medical_records TO anon;
GRANT SELECT ON public.user_roles TO anon;