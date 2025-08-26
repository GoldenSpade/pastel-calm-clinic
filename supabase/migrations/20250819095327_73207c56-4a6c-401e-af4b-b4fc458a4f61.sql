-- Create time_slots table for Maya to manage available appointment slots
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (15, 60, 90)),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table for storing bookings
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('consultation_15', 'session_60', 'session_90')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT contact_info_required CHECK (client_email IS NOT NULL OR client_phone IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Time slots are viewable by everyone" 
ON public.time_slots 
FOR SELECT 
USING (true);

CREATE POLICY "Appointments can be created by anyone" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Appointments are viewable by everyone" 
ON public.appointments 
FOR SELECT 
USING (true);

-- Admin policies (for future admin interface)
CREATE POLICY "Admin can manage time slots" 
ON public.time_slots 
FOR ALL 
USING (true);

CREATE POLICY "Admin can manage appointments" 
ON public.appointments 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_time_slots_start_time ON public.time_slots(start_time);
CREATE INDEX idx_time_slots_available ON public.time_slots(is_available);
CREATE INDEX idx_appointments_slot_id ON public.appointments(time_slot_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);