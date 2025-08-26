-- Fix the DELETE policy to work for all roles
DROP POLICY IF EXISTS "Allow appointment deletions" ON public.appointments;

CREATE POLICY "Allow appointment deletions" 
ON public.appointments 
FOR DELETE 
TO public
USING (true);