const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Initializing Supabase...');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection with better error handling
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase query error:', error);
      console.log('Error details:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
    } else {
      console.log('✅ Supabase connected successfully');
      console.log('Query result:', data);
    }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
  }
}

// Test connection
testConnection();

module.exports = supabase;