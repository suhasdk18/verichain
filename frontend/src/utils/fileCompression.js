// Remove the mock upload function and use real API
export const compressFile = async (file) => {
  // Only compress images, not PDFs
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 1920px)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality compression
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Real file upload function
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch('/api/upload/document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.document_url;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};