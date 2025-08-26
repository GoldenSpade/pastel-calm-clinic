-- Drop existing insecure policies
DROP POLICY IF EXISTS "Appointments are viewable by everyone" ON appointments;
DROP POLICY IF EXISTS "Appointments can be created by anyone" ON appointments;  
DROP POLICY IF EXISTS "Admin can manage appointments" ON appointments;

-- Create secure policies
-- Allow anyone to create appointments (for booking functionality)
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Completely restrict viewing appointments - only accessible through application logic
-- This removes the security vulnerability while maintaining booking functionality
CREATE POLICY "No direct appointment viewing" ON appointments
  FOR SELECT
  USING (false);

-- Allow updates/deletes only through application logic (for admin functions)
CREATE POLICY "No direct appointment modifications" ON appointments
  FOR UPDATE
  USING (false);

CREATE POLICY "No direct appointment deletions" ON appointments
  FOR DELETE  
  USING (false);
  