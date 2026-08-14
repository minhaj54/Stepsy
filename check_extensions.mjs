import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qevgemhdaslgavsrkyyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFldmdlbWhkYXNsZ2F2c3JreXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTMyNjIsImV4cCI6MjEwMDQ2OTI2Mn0.ltp3NYTsCvOYQcvSVQGowTxiqjArZVAIbKlPAUrpMJE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExtensions() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: "SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';"
  }).catch(() => ({ data: null, error: 'RPC not available' }));
  
  console.log('Extension check via RPC:', data, error);
  
  // Try using gen_random_uuid instead which is built-in to PostgreSQL 13+
  const { data: uuidData, error: uuidError } = await supabase.rpc('exec_sql', {
    query: "SELECT gen_random_uuid();"
  }).catch(() => ({ data: null, error: 'RPC not available' }));
  
  console.log('gen_random_uuid check:', uuidData, uuidError);
}

checkExtensions();
