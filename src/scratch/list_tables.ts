import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables_and_columns'); // If exists
  
  if (error) {
    console.log("RPC failed, trying information_schema...");
    const { data: tables, error: tableError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tableError) {
      console.error("Failed to list tables:", tableError);
      return;
    }
    console.log("Tables found:", tables.map(t => t.tablename).join(', '));
  } else {
    console.log("Tables and columns:", data);
  }
}

listTables();
