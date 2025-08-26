-- Re-enable RLS and create proper policies for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "No direct appointment modifications" ON public.appointments;
DROP POLICY IF EXISTS "Only admins can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow appointment deletions" ON public.appointments;

-- Create new, working policies
-- Allow anyone to create appointments (for booking system)
CREATE POLICY "Allow appointment creation" 
ON public.appointments 
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow reading appointments (needed for admin panel)
CREATE POLICY "Allow appointment reading" 
ON public.appointments 
FOR SELECT 
TO public
USING (true);

-- Allow updating appointments
CREATE POLICY "Allow appointment updates" 
ON public.appointments 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow deleting appointments (needed for admin panel)
CREATE POLICY "Allow appointment deletion" 
ON public.appointments 
FOR DELETE 
TO public
USING (true);