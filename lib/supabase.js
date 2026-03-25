import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aojqrexjcnwjmfdcfgfy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvanFyZXhqY253am1mZGNmZ2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzEwNzIsImV4cCI6MjA4OTYwNzA3Mn0.cWzP3HJUvUQchgPiHqn_Gp6iyp9c_LBylUj5Mdn5ZvM'

export const supabase = createClient(supabaseUrl, supabaseKey)
