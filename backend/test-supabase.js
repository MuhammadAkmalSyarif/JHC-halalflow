const fs = require('fs'); 
const { createClient } = require('@supabase/supabase-js'); 
require('dotenv').config({ path: './.env' }); 
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); 
async function run() { 
  const { data, error } = await supabase.storage.from('halal-flow-uploads').upload('test.txt', 'hello world', { upsert: true }); 
  console.log('Result for halal-flow-uploads:', data, error); 
  const { data2, error2 } = await supabase.storage.from('halalflow-uploads').upload('test.txt', 'hello world', { upsert: true }); 
  console.log('Result for halalflow-uploads:', data2, error2); 
} 
run();
