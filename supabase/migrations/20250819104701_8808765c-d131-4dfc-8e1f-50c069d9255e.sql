-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- Update the appointments SELECT policy to allow admin access
DROP POLICY IF EXISTS "No direct appointment viewing" ON public.appointments;

CREATE POLICY "Only admins can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

-- Update the get_admin_appointments function to verify admin access
CREATE OR REPLACE FUNCTION public.get_admin_appointments()
RETURNS TABLE (
    id UUID,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    session_type TEXT,
    notes TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    time_slot_id UUID,
    time_slot JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE SQL
AS $$
    -- Check if the current user is an admin
    SELECT 
        a.id,
        a.client_name,
        a.client_email,
        a.client_phone,
        a.session_type,
        a.notes,
        a.status,
        a.created_at,
        a.time_slot_id,
        to_jsonb(t.*) as time_slot
    FROM appointments a
    LEFT JOIN time_slots t ON a.time_slot_id = t.id
    WHERE a.status = 'confirmed'
    AND public.is_current_user_admin() = true  -- Verify admin access
    ORDER BY a.created_at DESC;
$$;

-- Update the get_admin_time_slots function to verify admin access
CREATE OR REPLACE FUNCTION public.get_admin_time_slots()
RETURNS TABLE (
    id UUID,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    is_available BOOLEAN,
    created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE SQL
AS $$
    -- Check if the current user is an admin
    SELECT 
        id,
        start_time,
        end_time,
        duration_minutes,
        is_available,
        created_at
    FROM time_slots
    WHERE start_time >= NOW()
    AND public.is_current_user_admin() = true  -- Verify admin access
    ORDER BY start_time;
$$;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert a default admin user (you'll need to replace this UUID with an actual user ID)
-- This is just a placeholder - in production, you'd assign admin role to a real user
-- INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin');
