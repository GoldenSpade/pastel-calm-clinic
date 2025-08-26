-- Drop and recreate the get_admin_time_slots function to include session_type
DROP FUNCTION public.get_admin_time_slots();

CREATE OR REPLACE FUNCTION public.get_admin_time_slots()
 RETURNS TABLE(id uuid, start_time timestamp with time zone, end_time timestamp with time zone, duration_minutes integer, is_available boolean, session_type text, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    -- Return time slots for admin access including session_type
    SELECT 
        id,
        start_time,
        end_time,
        duration_minutes,
        is_available,
        session_type,
        created_at
    FROM time_slots
    WHERE start_time >= NOW()
    ORDER BY start_time;
$function$
