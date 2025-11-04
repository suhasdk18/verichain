const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// User analytics
router.get('/user', auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: applications, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', user_id);

    if (error) throw error;

    const total = applications.length;
    const approved = applications.filter(app => app.status === 'Issued').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    const pending = applications.filter(app => app.status === 'Pending').length;

    res.status(200).json({ total, approved, rejected, pending });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// Admin analytics
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select('status');

    if (error) throw error;

    const total = applications.length;
    const approved = applications.filter(app => app.status === 'Issued').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    const pending = applications.filter(app => app.status === 'Pending').length;

    res.status(200).json({ total, approved, rejected, pending });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

module.exports = router;