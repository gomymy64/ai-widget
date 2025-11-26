import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axfttkwzxcvmybcenkhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZnR0a3d6eGN2bXliY2Vua2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODA2NTcsImV4cCI6MjA2ODI1NjY1N30.JKVzZkIeTS6MX9K-AEkncBUduIJdRMcZH11DEU-AC5w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);