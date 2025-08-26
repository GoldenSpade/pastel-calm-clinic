-- Remove the old restrictive constraint
ALTER TABLE time_slots DROP CONSTRAINT time_slots_duration_minutes_check;

-- Add a new constraint that allows any multiple of 15 minutes (minimum 15, maximum 480 = 8 hours)
ALTER TABLE time_slots ADD CONSTRAINT time_slots_duration_minutes_check 
CHECK (duration_minutes >= 15 AND duration_minutes <= 480 AND duration_minutes % 15 = 0);
