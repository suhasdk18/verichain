const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { sendOTP } = require('../utils/emailService');

const router = express.Router();

// Register Initiate
router.post('/register/initiate', async (req, res) => {
  try {
    const { email, password, aadhaar_number, phone_number } = req.body;

    if (!email || !password || !aadhaar_number || !phone_number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (aadhaar_number.length !== 12) {
      return res.status(400).json({ message: 'Aadhaar must be 12 digits' });
    }

    if (phone_number.length !== 10) {
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    // Check if verified user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_verified', true)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Delete any unverified user with same email
    await supabase.from('users').delete().eq('email', email).eq('is_verified', false);

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash,
          aadhaar_number,
          phone_number,
          role: 'user',
          is_verified: false,
          otp,
          otp_expiry,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Send OTP email
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Register Finalize
router.post('/register/finalize', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_verified', false)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await supabase
      .from('users')
      .update({ is_verified: true, otp: null, otp_expiry: null })
      .eq('id', user.id);

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration finalize error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Initiate
// Login Initiate - with detailed logging
router.post('/login/initiate', async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', req.body);
    
    const { email, password, aadhaar_number } = req.body;

    if (!email || !password || !aadhaar_number) {
      console.log('❌ Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('📧 Searching for user:', email);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_verified', true)
      .single();

    if (error) {
      console.log('❌ Database error:', error.message);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user) {
      console.log('❌ User not found or not verified');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', { 
      email: user.email, 
      is_verified: user.is_verified,
      has_password: !!user.password_hash 
    });

    // Verify password
    console.log('🔑 Verifying password...');
    // In your login route, add this debug:
console.log('Input password:', password);
console.log('Stored hash:', user.password_hash);
console.log('Hash length:', user.password_hash.length);

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
console.log('BCrypt result:', isPasswordValid);

// Also test with a known good comparison
const testHash = await bcrypt.hash('test123', 10);
const testCompare = await bcrypt.compare('test123', testHash);
    console.log('Test comparison:', testCompare);
    // Verify Aadhaar
    console.log('🆔 Verifying Aadhaar...');
    console.log('Input Aadhaar:', aadhaar_number);
    console.log('Stored Aadhaar:', user.aadhaar_number);
    const isAadhaarValid = user.aadhaar_number === aadhaar_number;
    console.log('Aadhaar valid:', isAadhaarValid);

    if (!isPasswordValid || !isAadhaarValid) {
      console.log('❌ Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Credentials verified successfully');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);

    console.log('📱 Generated OTP:', otp);

    // Update user with OTP
    await supabase
      .from('users')
      .update({ otp, otp_expiry })
      .eq('id', user.id);

    // Send OTP email
    await sendOTP(email, otp);

    console.log('✅ OTP sent to:', email);

    res.status(200).json({ message: 'OTP sent to email', email: user.email });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Login Finalize
router.post('/login/finalize', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    await supabase
      .from('users')
      .update({ otp: null, otp_expiry: null })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      aadhaar_number: user.aadhaar_number,
      phone_number: user.phone_number,
    };

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error('Login finalize error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;