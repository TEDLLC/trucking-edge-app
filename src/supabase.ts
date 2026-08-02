import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdzcopyxrgeimntgobrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkemNvcHl4cmdlaW1udGdvYnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjM1OTgsImV4cCI6MjEwMDkzOTU5OH0.O2oUaRCEzrO5rYqA38bSfoGx0GGr0rEy17WhMGBftCk';

export const supabase = createClient(supabaseUrl, supabaseKey);