const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnlwhgpjmjnzmxeslbks.supabase.co';
const supabaseKey = 'sb_pub...JCAf'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  // Querying information_schema.tables directly often requires RLS to be disabled or explicit permission
  // Let's try querying it.
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error('Error fetching tables:', error.message);
  } else {
    console.log('Tables:', data);
  }
}

listTables();
