const express = require('express');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Submit feedback/complaint
router.post('/submit-feedback', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const user_id = req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert([
        {
          user_id,
          message,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
});

// Initiate secure certificate view
router.post('/initiate-secure-view', auth, async (req, res) => {
  try {
    console.log('🔐 Secure view initiated by:', req.user.email);
    
    const { transactionHash, ipfsCid } = req.body;
    const user_id = req.user.id;
    const userEmail = req.user.email;

    if (!transactionHash || !ipfsCid) {
      return res.status(400).json({ message: 'Transaction hash and IPFS CID are required' });
    }

    console.log('🔍 Searching for certificate:', { transactionHash, ipfsCid });

    // Find application
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('transaction_hash', transactionHash)
      .eq('ipfs_cid', ipfsCid)
      .eq('status', 'Issued')
      .single();

    if (error || !application) {
      console.error('❌ Certificate not found:', error);
      return res.status(404).json({ message: 'Certificate not found with provided details' });
    }

    console.log('✅ Certificate found:', application.id);

    // Check permissions
    const isOwner = application.user_id === user_id;
    const isAdmin = req.user.role === 'admin';
    
    // Check if email is from authorized domain (.gov, .edu)
    const emailDomain = userEmail.split('@')[1];
    const isAuthorizedDomain = emailDomain.endsWith('.gov') || emailDomain.endsWith('.edu');

    console.log('🔒 Permission check:', { 
      isOwner, 
      isAdmin, 
      emailDomain, 
      isAuthorizedDomain 
    });

    if (!isOwner && !isAdmin && !isAuthorizedDomain) {
      return res.status(403).json({ 
        message: 'Access denied. Only certificate owners, admins, or authorized domains (.gov, .edu) can view certificates.' 
      });
    }

    // Generate a temporary access token (valid for 10 minutes)
    const accessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log('🎫 Generating temporary access token');

    // Store the temporary access token
    const { error: tokenError } = await supabase
      .from('temp_access_tokens')
      .insert([
        {
          token: accessToken,
          application_id: application.id,
          user_id: user_id,
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (tokenError) {
      console.error('❌ Failed to create access token:', tokenError);
      throw tokenError;
    }

    // Return secure view URL with the temporary token
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const secureViewUrl = `${backendUrl}/api/certificates/view-secure/${accessToken}`;
    
    console.log('✅ Access granted, secure URL generated');

    res.status(200).json({ 
      secureViewUrl,
      message: 'Access granted',
      expiresIn: 600 // seconds (10 minutes)
    });

  } catch (error) {
    console.error('❌ Secure view error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

module.exports = router;