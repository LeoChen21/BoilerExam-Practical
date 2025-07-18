import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('File uploaded successfully!');
        setSelectedFile(null);
        document.getElementById('file-input').value = '';
        fetchUploadedFiles();
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

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

  const viewFile = (fileId) => {
    window.open(`${API_URL}/files/${fileId}`, '_blank');
  };

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