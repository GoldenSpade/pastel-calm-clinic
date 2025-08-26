-- Reset the August 21st slots to be available again
UPDATE time_slots 
SET is_available = true 
WHERE DATE(start_time) = '2025-08-21';
