/**
 * BoilerExam Frontend Application
 * 
 * React application for uploading and viewing PDF files.
 * Provides a user interface for the BoilerExam PDF management system.
 */

import React, { useState } from 'react';
import './App.css';

// API base URL from environment or default to local development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Main App component
 * Handles file upload, display, and management functionality
 */
function App() {
  // State for currently selected file to upload
  const [selectedFile, setSelectedFile] = useState(null);
  // State for list of all uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // State for upload loading indicator
  const [loading, setLoading] = useState(false);

  /**
   * Handle file selection from input
   * Validates file type and updates state
   * @param {Event} event - File input change event
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  /**
   * Handle file upload process
   * Validates file, uploads to server, and updates UI
   */
  const handleUpload = async () => {
    // Validate file selection
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    // Check file size limit (50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxFileSize) {
      alert('File size too large. Maximum size is 50MB.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Send upload request to backend
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        alert('File uploaded successfully!');
        // Reset form state
        setSelectedFile(null);
        document.getElementById('file-input').value = '';
        // Refresh file list
        fetchUploadedFiles();
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Upload error:', error);
      
      // Handle different error types
      if (error.name === 'AbortError') {
        alert('Upload timed out. Please try again with a smaller file.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch list of uploaded files from server
   * Updates the uploadedFiles state
   */
  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/files`);
      if (response.ok) {
        const files = await response.json();
        setUploadedFiles(files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  /**
   * Open file in new browser tab for viewing
   * @param {string} fileId - UUID of the file to view
   */
  const viewFile = (fileId) => {
    window.open(`${API_URL}/files/${fileId}`, '_blank');
  };

  // Load uploaded files when component mounts
  React.useEffect(() => {
    fetchUploadedFiles();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BoilerExam PDF Upload</h1>
        
        <div className="upload-section">
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
          />
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>

        <div className="files-section">
          <h2>Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p>No files uploaded yet</p>
          ) : (
            <ul>
              {uploadedFiles.map((file) => (
                <li key={file.id}>
                  <span>{file.filename}</span>
                  <button onClick={() => viewFile(file.id)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;