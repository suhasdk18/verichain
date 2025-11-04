const express = require('express');
const axios = require('axios');
const { PDFDocument, rgb } = require('pdf-lib');
const supabase = require('../config/supabase');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

// Secure certificate viewer - decrypts and serves PDF for inline viewing
router.get('/view-secure/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log('🔐 Secure view requested with token');

    if (!token) {
      return res.status(401).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Access Denied - VeriChain</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
              .icon { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">🔒</div>
              <h1 class="error">Access Denied</h1>
              <p>No access token provided</p>
            </div>
          </body>
        </html>
      `);
    }

    // Verify the temporary access token
    const { data: accessToken, error: tokenError } = await supabase
      .from('temp_access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !accessToken) {
      console.error('❌ Invalid token');
      return res.status(401).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Token - VeriChain</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
              .icon { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1 class="error">Invalid Access Token</h1>
              <p>The provided access token is invalid or has been revoked</p>
            </div>
          </body>
        </html>
      `);
    }

    // Check if token is expired
    if (new Date(accessToken.expires_at) < new Date()) {
      console.error('❌ Token expired');
      
      // Delete expired token
      await supabase
        .from('temp_access_tokens')
        .delete()
        .eq('token', token);
        
      return res.status(401).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Token Expired - VeriChain</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
              .icon { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1 class="error">Access Token Expired</h1>
              <p>Your access token has expired (valid for 10 minutes)</p>
              <p>Please request a new verification link</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('✅ Token valid, fetching certificate');

    // Get the application with certificate details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', accessToken.application_id)
      .single();

    if (appError || !application) {
      console.error('❌ Certificate not found');
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Not Found - VeriChain</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
              .icon { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">📄</div>
              <h1 class="error">Certificate Not Found</h1>
              <p>The requested certificate could not be found</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('📥 Downloading encrypted PDF from IPFS');

    // Download encrypted PDF from IPFS
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${application.ipfs_cid}`;
    const response = await axios.get(ipfsUrl, { responseType: 'arraybuffer' });
    const encryptedBuffer = Buffer.from(response.data);

    console.log('🔓 Decrypting PDF');

    // Decrypt the PDF
    const decryptedBuffer = decrypt(encryptedBuffer, application.encryption_key);

    console.log('🖋️ Adding watermark to PDF');

    // Load PDF and add watermark
    const pdfDoc = await PDFDocument.load(decryptedBuffer);
    const pages = pdfDoc.getPages();
    
    const watermarkText = 'VERIFIED COPY - VERICHAIN';
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Add watermark to each page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      
      // Main diagonal watermark
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 20,
        color: rgb(0.8, 0.1, 0.1), // RED color for visibility
        opacity: 0.3, // More visible opacity
        rotate: { type: 'degrees', angle: 45 }, // Diagonal
      });
      
      // Additional watermark at bottom
      page.drawText(`Verified Copy - ${timestamp} - VeriChain Certificate`, {
        x: 50,
        y: 20,
        size: 10,
        color: rgb(0.9, 0.2, 0.2), // Bright red
        opacity: 0.5,
      });
      
      console.log(`✅ Watermark added to page ${index + 1}`);
    });

    // Convert back to buffer
    const watermarkedPdfBytes = await pdfDoc.save();
    const watermarkedBuffer = Buffer.from(watermarkedPdfBytes);

    console.log('✅ PDF watermarked and ready for inline viewing');

    // Serve the watermarked PDF for INLINE viewing (not download)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');
    res.setHeader('Content-Length', watermarkedBuffer.length);
    
    // Security headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Prevent the page from being embedded in iframes (clickjacking protection)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(watermarkedBuffer);

  } catch (error) {
    console.error('❌ View certificate error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Error - VeriChain</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              color: #333;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 500px;
            }
            .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            .details { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              font-size: 14px; 
              color: #666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1 class="error">Server Error</h1>
            <p>An error occurred while processing your request</p>
            <div class="details">${error.message}</div>
          </div>
        </body>
      </html>
    `);
  }
});

module.exports = router;