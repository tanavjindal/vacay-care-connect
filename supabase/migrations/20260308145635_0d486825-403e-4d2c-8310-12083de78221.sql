
-- =============================================
-- Convert ALL RESTRICTIVE policies to PERMISSIVE
-- Drop each RESTRICTIVE policy and recreate as PERMISSIVE
-- =============================================

-- ========== patients ==========
DROP POLICY IF EXISTS "Scoped patient access" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can insert own patient record" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can delete own patient record" ON public.patients;

CREATE POLICY "Scoped patient access" ON public.patients FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.hospital_staff hs
      JOIN public.hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN public.hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patients.id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

CREATE POLICY "Users can insert own patient record" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient record" ON public.patients FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own patient record" ON public.patients FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ========== patient_medical_records ==========
DROP POLICY IF EXISTS "Scoped medical records access" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Authenticated users can insert own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.patient_medical_records;

CREATE POLICY "Scoped medical records access" ON public.patient_medical_records FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.hospital_staff hs
      JOIN public.hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN public.hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patient_medical_records.patient_id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

CREATE POLICY "Users can insert own medical records" ON public.patient_medical_records FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can update own medical records" ON public.patient_medical_records FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete own medical records" ON public.patient_medical_records FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

-- ========== user_consents ==========
DROP POLICY IF EXISTS "Users can insert their own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can view their own consents" ON public.user_consents;

CREATE POLICY "Users can insert own consents" ON public.user_consents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own consents" ON public.user_consents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ========== profiles ==========
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Users can only assign default user role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "No self-role-deletion" ON public.user_roles;
DROP POLICY IF EXISTS "No role updates" ON public.user_roles;

CREATE POLICY "Users can only assign default user role" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'user');

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Keep deletion/update blocked via RESTRICTIVE on top of permissive select
-- Actually we need a different approach: just don't create DELETE/UPDATE permissive policies
-- No permissive DELETE or UPDATE = no access. That's the correct behavior.

-- ========== hospital_staff ==========
DROP POLICY IF EXISTS "Hospital admins can add staff" ON public.hospital_staff;
DROP POLICY IF EXISTS "Staff can view their own hospital staff" ON public.hospital_staff;
DROP POLICY IF EXISTS "Hospital admins can remove staff" ON public.hospital_staff;

CREATE POLICY "Hospital admins can add staff" ON public.hospital_staff FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hospital_staff existing
      WHERE existing.hospital_id = hospital_staff.hospital_id
        AND existing.user_id = auth.uid()
        AND existing.is_admin = true
    )
  );

CREATE POLICY "Staff can view own hospital staff" ON public.hospital_staff FOR SELECT TO authenticated
  USING (is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Hospital admins can remove staff" ON public.hospital_staff FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_staff admin
      WHERE admin.hospital_id = hospital_staff.hospital_id
        AND admin.user_id = auth.uid()
        AND admin.is_admin = true
    )
  );

-- ========== hospitals ==========
DROP POLICY IF EXISTS "No direct hospital creation" ON public.hospitals;
DROP POLICY IF EXISTS "Hospital staff can view their hospital" ON public.hospitals;

CREATE POLICY "No direct hospital creation" ON public.hospitals FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Hospital staff can view their hospital" ON public.hospitals FOR SELECT TO authenticated
  USING (is_hospital_staff(auth.uid(), id));

-- ========== hospital_subscriptions ==========
DROP POLICY IF EXISTS "Hospital staff can create subscription for their hospital" ON public.hospital_subscriptions;
DROP POLICY IF EXISTS "Hospital staff can view their subscription" ON public.hospital_subscriptions;

CREATE POLICY "Hospital admins can create subscription" ON public.hospital_subscriptions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hospital_staff
      WHERE hospital_staff.hospital_id = hospital_subscriptions.hospital_id
        AND hospital_staff.user_id = auth.uid()
        AND hospital_staff.is_admin = true
    )
  );

CREATE POLICY "Hospital staff can view subscription" ON public.hospital_subscriptions FOR SELECT TO authenticated
  USING (is_hospital_staff(auth.uid(), hospital_id));

-- ========== hospital_patient_access_logs ==========
DROP POLICY IF EXISTS "No direct access log insertion" ON public.hospital_patient_access_logs;
DROP POLICY IF EXISTS "Hospital staff can view access logs for their hospital" ON public.hospital_patient_access_logs;

CREATE POLICY "No direct access log insertion" ON public.hospital_patient_access_logs FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Hospital staff can view access logs" ON public.hospital_patient_access_logs FOR SELECT TO authenticated
  USING (is_hospital_staff(auth.uid(), hospital_id));
