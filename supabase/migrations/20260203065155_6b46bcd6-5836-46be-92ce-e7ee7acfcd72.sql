-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'hospital_admin', 'hospital_staff');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create hospitals table
CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Create hospital_staff table to link users to hospitals
CREATE TABLE public.hospital_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (hospital_id, user_id)
);

-- Enable RLS on hospital_staff
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;

-- Create subscription_plan enum
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'basic', 'standard', 'premium');

-- Create hospital_subscriptions table
CREATE TABLE public.hospital_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan subscription_plan NOT NULL DEFAULT 'trial',
    price_rupees INTEGER NOT NULL DEFAULT 0,
    duration_months INTEGER NOT NULL DEFAULT 1,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hospital_subscriptions
ALTER TABLE public.hospital_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create patients table (for hospital lookup)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    national_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    qr_code_token UUID DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create patient_medical_records table
CREATE TABLE public.patient_medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    record_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    original_language TEXT DEFAULT 'en',
    translated_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patient_medical_records
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- Create hospital_patient_access_logs table (for audit trail)
CREATE TABLE public.hospital_patient_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    accessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    access_method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access logs
ALTER TABLE public.hospital_patient_access_logs ENABLE ROW LEVEL SECURITY;

-- Function to check if user is hospital staff
CREATE OR REPLACE FUNCTION public.is_hospital_staff(_user_id UUID, _hospital_id UUID)
RETURNS BOOLEAN
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

-- Function to check if user belongs to any hospital with active subscription
CREATE OR REPLACE FUNCTION public.user_has_active_hospital_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hospital_staff hs
    JOIN public.hospital_subscriptions sub ON sub.hospital_id = hs.hospital_id
    WHERE hs.user_id = _user_id
      AND sub.is_active = true
      AND (sub.subscription_ends_at IS NULL OR sub.subscription_ends_at > now())
  )
$$;

-- RLS Policies for hospitals
CREATE POLICY "Hospital staff can view their hospital"
ON public.hospitals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hospital_staff
    WHERE hospital_staff.hospital_id = hospitals.id
    AND hospital_staff.user_id = auth.uid()
  )
);

-- RLS Policies for hospital_staff
CREATE POLICY "Staff can view their own hospital staff"
ON public.hospital_staff FOR SELECT
USING (
  hospital_id IN (
    SELECT hospital_id FROM public.hospital_staff WHERE user_id = auth.uid()
  )
);

-- RLS Policies for hospital_subscriptions
CREATE POLICY "Hospital staff can view their subscription"
ON public.hospital_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hospital_staff
    WHERE hospital_staff.hospital_id = hospital_subscriptions.hospital_id
    AND hospital_staff.user_id = auth.uid()
  )
);

-- RLS Policies for patients (hospital staff with active subscription can view)
CREATE POLICY "Hospital staff can view patients"
ON public.patients FOR SELECT
USING (
  user_has_active_hospital_subscription(auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Users can insert their own patient record"
ON public.patients FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patient record"
ON public.patients FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for patient_medical_records
CREATE POLICY "Hospital staff can view medical records"
ON public.patient_medical_records FOR SELECT
USING (
  user_has_active_hospital_subscription(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.patients
    WHERE patients.id = patient_medical_records.patient_id
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own medical records"
ON public.patient_medical_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patients
    WHERE patients.id = patient_medical_records.patient_id
    AND patients.user_id = auth.uid()
  )
);

-- RLS Policies for access logs
CREATE POLICY "Hospital staff can view access logs for their hospital"
ON public.hospital_patient_access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hospital_staff
    WHERE hospital_staff.hospital_id = hospital_patient_access_logs.hospital_id
    AND hospital_staff.user_id = auth.uid()
  )
);

CREATE POLICY "Hospital staff can insert access logs"
ON public.hospital_patient_access_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hospital_staff
    WHERE hospital_staff.hospital_id = hospital_patient_access_logs.hospital_id
    AND hospital_staff.user_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_subscriptions_updated_at
BEFORE UPDATE ON public.hospital_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_medical_records_updated_at
BEFORE UPDATE ON public.patient_medical_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();