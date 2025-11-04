import React, { useState } from 'react';
import { compressFile, uploadToCloudinary } from '../../utils/fileCompression';

const DocumentUpload = ({ onUploadComplete, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Please upload only JPG, PNG, or PDF files');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Compress file if it's an image
      const compressedFile = await compressFile(selectedFile);
      
      // Upload to Cloudinary
      const documentUrl = await uploadToCloudinary(compressedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notify parent component
      onUploadComplete(documentUrl);
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
        setUploading(false);
      }, 1000);

    } catch (error) {
      onUploadError('Upload failed: ' + error.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploading(false);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div style={styles.documentUpload}>
      <div style={styles.uploadArea}>
        {!selectedFile ? (
          <div style={styles.uploadPlaceholder}>
            <input
              type="file"
              id="document-upload"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="document-upload" style={styles.uploadLabel}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
              <div>Click to select document</div>
              <small style={{ color: '#666', marginTop: '5px' }}>
                Supported: JPG, PNG, PDF (Max 5MB)
              </small>
            </label>
          </div>
        ) : (
          <div style={styles.filePreview}>
            <div style={styles.fileInfo}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>
                {getFileIcon(selectedFile.type)}
              </span>
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedFile.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            {uploading && (
              <div style={styles.uploadProgress}>
                <div style={styles.progressBar}>
                  <div 
                    style={{ 
                      ...styles.progressFill, 
                      width: `${progress}%` 
                    }} 
                  ></div>
                </div>
                <div style={{ fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>
                  {progress}% Uploading...
                </div>
              </div>
            )}

            <div style={styles.uploadActions}>
              {!uploading ? (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpload}
                  >
                    Upload Document
                  </button>
                  <button 
                    className="btn"
                    onClick={handleCancel}
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-danger"
                  onClick={handleCancel}
                  disabled={progress >= 100}
                >
                  Cancel Upload
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  documentUpload: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    transition: 'border-color 0.3s ease',
  },
  uploadArea: {
    // Container styles
  },
  uploadPlaceholder: {
    // Placeholder styles
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
    padding: '20px',
  },
  filePreview: {
    textAlign: 'left',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '5px',
  },
  uploadProgress: {
    marginBottom: '15px',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#e9ecef',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#28a745',
    transition: 'width 0.3s ease',
  },
  uploadActions: {
    display: 'flex',
    gap: '10px',
  },
};

export default DocumentUpload;