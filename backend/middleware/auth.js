const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware triggered');
    console.log('📍 Route:', req.method, req.originalUrl);
    
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('⚠️ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔑 Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    // Use userId as that's what's in the token
    const userId = decoded.userId;
    console.log('👤 Looking up user ID:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found in token');
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('❌ User lookup failed:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('✅ User authenticated:', user.email, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('🔒 Checking admin role for user:', req.user.email);
  if (req.user.role !== 'admin') {
    console.warn('⚠️ Access denied - user is not admin');
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  console.log('✅ Admin access granted');
  next();
};

const isAuthority = (req, res, next) => {
  console.log('🔒 Checking authority role for user:', req.user.email);
  if (req.user.role !== 'authority' && req.user.role !== 'admin') {
    console.warn('⚠️ Access denied - user is not authority');
    return res.status(403).json({ message: 'Access denied. Authority access required.' });
  }
  console.log('✅ Authority access granted');
  next();
};

module.exports = { auth, isAdmin, isAuthority };