-- Allow admins to delete appointments
DROP POLICY IF EXISTS "No direct appointment deletions" ON public.appointments;

CREATE POLICY "Only admins can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (is_current_user_admin());