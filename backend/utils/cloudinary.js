const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, fileName) => {
  try {
    console.log('☁️ Uploading to Cloudinary:', fileName);
    
    // Clean the file name
    const cleanFileName = (fileName) => {
      let name = fileName.split('/').pop();
      name = name.replace(/\.[^/.]+$/, ""); // Remove extension
      name = name.replace(/[^a-zA-Z0-9-_]/g, "_");
      return name.substring(0, 100);
    };
    const cleanedName = cleanFileName(fileName);
    
    // Determine resource type
    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    const resourceType = isPDF ? 'raw' : 'image';
    
    const publicId = `verichain/${Date.now()}_${cleanedName}`;
    
    console.log('📝 Cloudinary upload details:', {
      originalName: fileName,
      cleanedName: cleanedName,
      resourceType: resourceType,
      isPDF: isPDF
    });
    
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: resourceType,
        public_id: publicId,
        folder: 'verichain-documents',
        access_mode: 'public',
      };
      
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            let finalUrl = result.secure_url;
            
            // For PDFs, return a URL that will work with Google Docs Viewer
            if (isPDF) {
              // Store the raw Cloudinary URL but return a Google Docs viewer URL
              finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(result.secure_url)}&embedded=true`;
            }
            
            console.log('✅ File uploaded to Cloudinary:', finalUrl);
            resolve(finalUrl);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };