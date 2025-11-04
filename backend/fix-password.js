const bcrypt = require('bcryptjs');

async function fixPassword() {
  const password = 'admin123';
  
  // Generate new hash
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('=== NEW PASSWORD HASH ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Hash length:', hash.length);
  
  // Verify it works
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification test:', isValid);
  
  // SQL to update
  console.log('\n=== SQL TO RUN ===');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@verichain.com';`);
}

fixPassword();