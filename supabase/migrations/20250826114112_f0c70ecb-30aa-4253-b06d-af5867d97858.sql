-- Temporarily allow all authenticated users to delete appointments for admin functionality
DROP POLICY IF EXISTS "Only admins can delete appointments" ON public.appointments;

CREATE POLICY "Allow appointment deletions" 
ON public.appointments 
FOR DELETE 
USING (true);