import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aojqrexjcnwjmfdcfgfy.supabase.co'
const supabaseKey = 'sb_publishable_wCD4iCoimK9O_Js-975OdA_zwii0paQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
