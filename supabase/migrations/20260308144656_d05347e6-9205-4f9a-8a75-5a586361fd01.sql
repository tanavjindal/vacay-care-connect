
-- Fix remaining security issues

-- 1. Remove direct INSERT on hospital_patient_access_logs
-- Access logs should ONLY be created via secure functions (lookup_patient_by_qr, log_patient_access)
DROP POLICY IF EXISTS "Hospital staff can insert access logs" ON public.hospital_patient_access_logs;

-- Block direct inserts - only server-side SECURITY DEFINER functions can insert
CREATE POLICY "No direct access log insertion"
  ON public.hospital_patient_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- 2. Fix patient write policies to target authenticated role only
DROP POLICY IF EXISTS "Users can insert their own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON public.patients;

CREATE POLICY "Authenticated users can insert own patient record"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own patient record"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Fix patient SELECT to also target authenticated only
DROP POLICY IF EXISTS "Scoped patient access" ON public.patients;

CREATE POLICY "Scoped patient access"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 
      FROM public.hospital_staff hs
      JOIN public.hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN public.hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patients.id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

-- 4. Fix medical records SELECT to target authenticated only
DROP POLICY IF EXISTS "Scoped medical records access" ON public.patient_medical_records;

CREATE POLICY "Scoped medical records access"
  ON public.patient_medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_records.patient_id
        AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.hospital_staff hs
      JOIN public.hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN public.hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patient_medical_records.patient_id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

-- 5. Fix medical records INSERT to target authenticated only
DROP POLICY IF EXISTS "Users can insert their own medical records" ON public.patient_medical_records;

CREATE POLICY "Authenticated users can insert own medical records"
  ON public.patient_medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_records.patient_id
        AND p.user_id = auth.uid()
    )
  );
