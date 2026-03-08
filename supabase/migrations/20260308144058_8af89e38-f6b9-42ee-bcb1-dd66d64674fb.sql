
-- ============================================
-- COMPREHENSIVE SECURITY HARDENING MIGRATION
-- ============================================

-- 1. DROP INSECURE POLICIES
DROP POLICY IF EXISTS "Authenticated users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can create staff link" ON public.hospital_staff;
DROP POLICY IF EXISTS "Allow hospital creation" ON public.hospitals;
DROP POLICY IF EXISTS "Hospital staff can view patients" ON public.patients;
DROP POLICY IF EXISTS "Hospital staff can view medical records" ON public.patient_medical_records;

-- 2a. user_roles: Only allow 'user' role self-assignment
CREATE POLICY "Users can only assign default user role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND role = 'user'
  );

-- 2b. Prevent user_roles deletion and updates
CREATE POLICY "No self-role-deletion"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (false);

CREATE POLICY "No role updates"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (false);

-- 2c. hospital_staff: Only existing hospital admins can add staff
CREATE POLICY "Hospital admins can add staff"
  ON public.hospital_staff FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hospital_staff existing
      WHERE existing.hospital_id = hospital_staff.hospital_id
        AND existing.user_id = auth.uid()
        AND existing.is_admin = true
    )
  );

-- 2d. Hospital admins can remove staff
CREATE POLICY "Hospital admins can remove staff"
  ON public.hospital_staff FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_staff admin
      WHERE admin.hospital_id = hospital_staff.hospital_id
        AND admin.user_id = auth.uid()
        AND admin.is_admin = true
    )
  );

-- 2e. No direct hospital creation - use register_hospital function
CREATE POLICY "No direct hospital creation"
  ON public.hospitals FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- 3. Secure hospital registration function
CREATE OR REPLACE FUNCTION public.register_hospital(
  _hospital_name text,
  _registration_number text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _city text DEFAULT NULL,
  _state text DEFAULT NULL,
  _email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _hospital_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.hospital_staff WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already belongs to a hospital';
  END IF;

  INSERT INTO public.hospitals (name, registration_number, phone, city, state, email)
  VALUES (_hospital_name, _registration_number, _phone, _city, _state, _email)
  RETURNING id INTO _hospital_id;

  INSERT INTO public.hospital_staff (hospital_id, user_id, is_admin)
  VALUES (_hospital_id, _user_id, true);

  INSERT INTO public.hospital_subscriptions (hospital_id, plan, price_rupees, duration_months, trial_ends_at, subscription_ends_at, is_active)
  VALUES (_hospital_id, 'trial', 0, 1, now() + interval '1 month', now() + interval '1 month', true);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'hospital_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _hospital_id;
END;
$$;

-- 4. Scoped patient access (only patients seen at your hospital + own records)
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

-- 5. Scoped medical records access
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

-- 6. Secure patient lookup functions
CREATE OR REPLACE FUNCTION public.lookup_patient_by_qr(
  _qr_token uuid,
  _hospital_id uuid
)
RETURNS TABLE (
  id uuid,
  full_name text,
  date_of_birth date,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  national_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _patient_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_hospital_staff(_user_id, _hospital_id) THEN
    RAISE EXCEPTION 'Not authorized: not staff at this hospital';
  END IF;

  IF NOT public.user_has_active_hospital_subscription(_user_id) THEN
    RAISE EXCEPTION 'No active subscription';
  END IF;

  SELECT p.id INTO _patient_id FROM public.patients p WHERE p.qr_code_token = _qr_token;
  
  IF _patient_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.hospital_patient_access_logs (hospital_id, patient_id, accessed_by, access_method)
  VALUES (_hospital_id, _patient_id, _user_id, 'qr_scan');

  RETURN QUERY
  SELECT p.id, p.full_name, p.date_of_birth, p.blood_type, p.allergies, 
         p.chronic_conditions, p.emergency_contact_name, p.emergency_contact_phone, p.national_id
  FROM public.patients p WHERE p.id = _patient_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_patient_by_name(
  _search_name text,
  _hospital_id uuid
)
RETURNS TABLE (
  id uuid,
  full_name text,
  date_of_birth date,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  national_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_hospital_staff(_user_id, _hospital_id) THEN
    RAISE EXCEPTION 'Not authorized: not staff at this hospital';
  END IF;

  IF NOT public.user_has_active_hospital_subscription(_user_id) THEN
    RAISE EXCEPTION 'No active subscription';
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name, p.date_of_birth, p.blood_type, p.allergies,
         p.chronic_conditions, p.emergency_contact_name, p.emergency_contact_phone, p.national_id
  FROM public.patients p
  WHERE p.full_name ILIKE '%' || _search_name || '%'
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_patient_access(
  _patient_id uuid,
  _hospital_id uuid,
  _access_method text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_hospital_staff(_user_id, _hospital_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.hospital_patient_access_logs (hospital_id, patient_id, accessed_by, access_method)
  VALUES (_hospital_id, _patient_id, _user_id, _access_method);
END;
$$;

-- 7. Add missing protection policies
CREATE POLICY "Users can delete own patient record"
  ON public.patients FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own medical records"
  ON public.patient_medical_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_records.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own medical records"
  ON public.patient_medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_records.patient_id
        AND p.user_id = auth.uid()
    )
  );
