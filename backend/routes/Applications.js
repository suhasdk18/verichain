const express = require('express');
const { auth } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Apply for certificate
router.post('/apply', auth, async (req, res) => {
  try {
    const { full_name, father_name, address, certificate_type, document_url } = req.body;
    const user_id = req.user.id;

    if (!full_name || !father_name || !address || !certificate_type || !document_url) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { data: application, error } = await supabase
      .from('applications')
      .insert([
        {
          user_id,
          certificate_type,
          full_name,
          father_name,
          address,
          document_url,
          status: 'Pending',
          downloaded: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// Get user's applications
router.get('/my-list', auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
});

module.exports = router;