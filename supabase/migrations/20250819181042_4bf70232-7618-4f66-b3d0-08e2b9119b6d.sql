-- Add session_type column to time_slots table to separate slots for different session durations
ALTER TABLE public.time_slots 
ADD COLUMN session_type TEXT NOT NULL DEFAULT '15min' 
CHECK (session_type IN ('15min', '60min', '90min'));

-- Create index for better performance when filtering by session type
CREATE INDEX idx_time_slots_session_type ON public.time_slots(session_type);

-- Update existing slots to be 60min type (assuming existing slots are for longer sessions)
UPDATE public.time_slots SET session_type = '60min' WHERE duration_minutes >= 60;
