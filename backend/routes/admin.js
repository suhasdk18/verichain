const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');
const { generateCertificatePDF } = require('../utils/pdfGenerator');
const { encrypt, generateEncryptionKey } = require('../utils/encryption');
const { contract } = require('../config/ethers');
const { ethers } = require('ethers');
const pinataService = require('../utils/pinata');

const router = express.Router();

// Get pending applications
router.get('/pending', auth, isAdmin, async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        users (email, aadhaar_number, phone_number)
      `)
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ message: 'Server error while fetching pending applications' });
  }
});

// Approve application
router.post('/approve/:appId', auth, isAdmin, async (req, res) => {
  try {
    const appId = req.params.appId;

    // Fetch application with user details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        users (*)
      `)
      .eq('id', appId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(application, application.users);

    // Generate encryption key and encrypt PDF
    const encryptionKey = generateEncryptionKey();
    const encryptedPDF = encrypt(pdfBuffer, encryptionKey);

    // Upload to IPFS via Pinata
    const ipfsResponse = await pinataService.uploadToIPFS(
      encryptedPDF, 
      `certificate_${appId}.encrypted.pdf`
    );

    const ipfsCid = ipfsResponse.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

    // Generate data hash for blockchain
    const dataHash = ethers.sha256(ethers.toUtf8Bytes(`ID:${appId},USER:${application.user_id},TYPE:${application.certificate_type}`));

    // Send transaction to blockchain
    const tx = await contract.issueCertificate(dataHash, ipfsCid);
    const receipt = await tx.wait();
    const transactionHash = receipt.hash;

    // Update application in database
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'Issued',
        ipfs_cid: ipfsCid,
        ipfs_url: ipfsUrl,
        transaction_hash: transactionHash,
        data_hash: dataHash,
        encryption_key: encryptionKey,
        downloaded: false,
        updated_at: new Date()
      })
      .eq('id', appId);

    if (updateError) throw updateError;

    res.status(200).json({ 
      message: 'Application approved and certificate issued',
      transactionHash,
      ipfsCid
    });

  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error during approval process' });
  }
});

// Reject application
router.post('/reject/:appId', auth, isAdmin, async (req, res) => {
  try {
    const appId = req.params.appId;

    const { error } = await supabase
      .from('applications')
      .update({ 
        status: 'Rejected',
        updated_at: new Date()
      })
      .eq('id', appId);

    if (error) throw error;

    res.status(200).json({ message: 'Application rejected' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Server error during rejection' });
  }
});

module.exports = router;