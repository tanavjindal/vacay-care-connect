
-- =============================================
-- DROP ALL RESTRICTIVE POLICIES AND RECREATE AS PERMISSIVE
-- =============================================

-- HOSPITALS
DROP POLICY IF EXISTS "No direct hospital creation" ON public.hospitals;
DROP POLICY IF EXISTS "Hospital staff can view their hospital" ON public.hospitals;

CREATE POLICY "No direct hospital creation" ON public.hospitals FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "Hospital staff can view their hospital" ON public.hospitals FOR SELECT TO authenticated USING (public.is_hospital_staff(auth.uid(), id));

-- PATIENTS
DROP POLICY IF EXISTS "Scoped patient access" ON public.patients;
DROP POLICY IF EXISTS "Users can insert own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can delete own patient record" ON public.patients;

CREATE POLICY "Scoped patient access" ON public.patients FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM hospital_staff hs
      JOIN hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patients.id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

CREATE POLICY "Users can insert own patient record" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient record" ON public.patients FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own patient record" ON public.patients FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- PATIENT_MEDICAL_RECORDS
DROP POLICY IF EXISTS "Scoped medical records access" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.patient_medical_records;

CREATE POLICY "Scoped medical records access" ON public.patient_medical_records FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM hospital_staff hs
      JOIN hospital_patient_access_logs alog ON alog.hospital_id = hs.hospital_id
      JOIN hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
      WHERE hs.user_id = auth.uid()
        AND alog.patient_id = patient_medical_records.patient_id
        AND sub.is_active = true
        AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
    )
  );

CREATE POLICY "Users can insert own medical records" ON public.patient_medical_records FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can update own medical records" ON public.patient_medical_records FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete own medical records" ON public.patient_medical_records FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_medical_records.patient_id AND p.user_id = auth.uid()));

-- USER_ROLES
DROP POLICY IF EXISTS "Users can only assign default user role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can only assign default user role" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'user'::app_role);

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- USER_CONSENTS
DROP POLICY IF EXISTS "Users can insert own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can view own consents" ON public.user_consents;

CREATE POLICY "Users can insert own consents" ON public.user_consents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own consents" ON public.user_consents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- HOSPITAL_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Hospital staff can view subscription" ON public.hospital_subscriptions;
DROP POLICY IF EXISTS "No direct subscription creation" ON public.hospital_subscriptions;

CREATE POLICY "Hospital staff can view subscription" ON public.hospital_subscriptions FOR SELECT TO authenticated
  USING (public.is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "No direct subscription creation" ON public.hospital_subscriptions FOR INSERT TO authenticated
  WITH CHECK (false);

-- HOSPITAL_STAFF
DROP POLICY IF EXISTS "Hospital admins can add staff" ON public.hospital_staff;
DROP POLICY IF EXISTS "Staff can view own hospital staff" ON public.hospital_staff;
DROP POLICY IF EXISTS "Hospital admins can remove staff" ON public.hospital_staff;

CREATE POLICY "Hospital admins can add staff" ON public.hospital_staff FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM hospital_staff existing
    WHERE existing.hospital_id = hospital_staff.hospital_id
      AND existing.user_id = auth.uid()
      AND existing.is_admin = true
  ));

CREATE POLICY "Staff can view own hospital staff" ON public.hospital_staff FOR SELECT TO authenticated
  USING (public.is_hospital_staff(auth.uid(), hospital_id));

CREATE POLICY "Hospital admins can remove staff" ON public.hospital_staff FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM hospital_staff admin
    WHERE admin.hospital_id = hospital_staff.hospital_id
      AND admin.user_id = auth.uid()
      AND admin.is_admin = true
  ));

-- PROFILES
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HOSPITAL_PATIENT_ACCESS_LOGS
DROP POLICY IF EXISTS "No direct access log insertion" ON public.hospital_patient_access_logs;
DROP POLICY IF EXISTS "Hospital staff can view access logs" ON public.hospital_patient_access_logs;

CREATE POLICY "No direct access log insertion" ON public.hospital_patient_access_logs FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Hospital staff can view access logs" ON public.hospital_patient_access_logs FOR SELECT TO authenticated
  USING (public.is_hospital_staff(auth.uid(), hospital_id));

-- RESTORE handle_new_user TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
