-- Create a security definer function for admin to safely access appointments
-- This function bypasses RLS and should only be called by authenticated admin users
CREATE OR REPLACE FUNCTION get_admin_appointments()
RETURNS TABLE (
  id uuid,
  client_name text,
  client_email text,
  client_phone text,
  session_type text,
  notes text,
  status text,
  created_at timestamptz,
  time_slot_id uuid,
  time_slot jsonb
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
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
  ORDER BY a.created_at DESC;
$$;

-- Create a security definer function for admin to safely access time slots
CREATE OR REPLACE FUNCTION get_admin_time_slots()
RETURNS TABLE (
  id uuid,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  is_available boolean,
  created_at timestamptz
)
SECURITY DEFINER  
SET search_path = public
LANGUAGE sql
AS $$
  SELECT 
    id,
    start_time,
    end_time,
    duration_minutes,
    is_available,
    created_at
  FROM time_slots
  WHERE start_time >= NOW()
  ORDER BY start_time;
$$;
