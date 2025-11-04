const express = require('express');
const { auth } = require('../middleware/auth');
const supabase = require('../config/supabase');
const { decrypt } = require('../utils/encryption');
const JSZip = require('jszip');
const axios = require('axios');
const { PDFDocument } = require('pdf-lib');

const router = express.Router();

// Download certificate package
router.get('/zip/:appId', auth, async (req, res) => {
  try {
    const appId = req.params.appId;

    // Verify user owns the application
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', appId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'Issued') {
      return res.status(400).json({ message: 'Certificate not issued yet' });
    }

    if (application.downloaded) {
      return res.status(400).json({ message: 'Certificate already downloaded' });
    }

    // Fetch encrypted PDF from IPFS
    const ipfsResponse = await axios.get(application.ipfs_url, {
      responseType: 'arraybuffer'
    });
    const encryptedPDF = Buffer.from(ipfsResponse.data);

    // Decrypt PDF
    const decryptedPDF = decrypt(encryptedPDF, application.encryption_key);

    // Modify PDF to add verification info
    const pdfDoc = await PDFDocument.load(decryptedPDF);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    firstPage.drawText(`IPFS CID: ${application.ipfs_cid}`, {
      x: 50,
      y: 95,
      size: 8,
    });
    
    firstPage.drawText(`Transaction: ${application.transaction_hash}`, {
      x: 50,
      y: 85,
      size: 8,
    });

    const modifiedPDF = await pdfDoc.save();

    // Create ZIP package
    const zip = new JSZip();
    
    // Add certificate PDF
    zip.file('Certificate.pdf', Buffer.from(modifiedPDF));
    
    // Add blockchain proof
    const blockchainProof = {
      applicationId: application.id,
      transactionHash: application.transaction_hash,
      ipfsCid: application.ipfs_cid,
      dataHash: application.data_hash,
      issueDate: application.updated_at,
      certificateType: application.certificate_type
    };
    zip.file('blockchain_proof.json', JSON.stringify(blockchainProof, null, 2));
    
    // Add README
    const readme = `VERICHAIN CERTIFICATE PACKAGE
    
This package contains your digitally verified certificate.

Files:
- Certificate.pdf: Your official certificate
- blockchain_proof.json: Verification data stored on blockchain

Verification:
1. Visit: ${process.env.FRONTEND_URL}/verify
2. Enter Transaction Hash: ${application.transaction_hash}
3. Or scan QR code on certificate

Security Note: This is a one-time download. Keep these files secure.`;
    
    zip.file('README.md', readme);

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Mark as downloaded
    await supabase
      .from('applications')
      .update({ downloaded: true })
      .eq('id', appId);

    // Send ZIP file
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="certificate_${appId}.zip"`,
      'Content-Length': zipBuffer.length
    });

    res.send(zipBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
});

module.exports = router;