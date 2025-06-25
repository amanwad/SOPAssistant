import React, { useState, useRef } from 'react';
import './FileUploadComponent.css';

const FileUploadComponent = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      status: 'pending'
    }));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      const formData = new FormData();
      formData.append('file', file.file);

      try {
        const response = await fetch('http://127.0.0.1:8000/upload/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'completed' } : f
        ));
        setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error' } : f
        ));
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
        console.error('Upload failed:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '⬆️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <h3>Drag & Drop files here</h3>
          <p>or click to browse files</p>
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="files-section">
          <div className="files-header">
            <h3>Selected Files ({files.length})</h3>
            <button 
              className="upload-btn"
              onClick={uploadFiles}
              disabled={files.every(f => f.status !== 'pending')}
            >
              Upload All Files
            </button>
          </div>
          
          <div className="files-list">
            {files.map((file) => (
              <div key={file.id} className={`file-item ${file.status}`}>
                <div className="file-info">
                  <span className="file-icon">{getStatusIcon(file.status)}</span>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                </div>
                
                {file.status === 'uploading' && uploadProgress[file.id] && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress[file.id]}%` }}
                    ></div>
                    <span className="progress-text">
                      {Math.round(uploadProgress[file.id])}%
                    </span>
                  </div>
                )}
                
                <button 
                  className="remove-btn"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === 'uploading'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upload-info">
        <h4>How to access uploaded files:</h4>
        <ul>
          <li><strong>File Object:</strong> Access via <code>file.file</code> property</li>
          <li><strong>File Name:</strong> Access via <code>file.name</code></li>
          <li><strong>File Size:</strong> Access via <code>file.size</code> (in bytes)</li>
          <li><strong>File Type:</strong> Access via <code>file.type</code> (MIME type)</li>
          <li><strong>Read Content:</strong> Use FileReader API for text files</li>
          <li><strong>Send to Server:</strong> Use FormData with fetch/axios</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadComponent;
