-- Temporarily modify admin functions to work without user role verification
-- This will be replaced with proper user authentication later

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
    -- Return time slots for admin access (temporarily removing role check)
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
    -- Return appointments for admin access (temporarily removing role check)
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
