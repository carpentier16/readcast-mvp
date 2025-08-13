import React, { useState } from 'react';

const UploadSection = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      console.log('Uploading file:', file.name);
      // Logique d'upload à implémenter
    }
  };

  return (
    <div className="upload-section">
      <h2>Upload PDF</h2>
      <div className="upload-area">
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileChange}
        />
        {file && (
          <div>
            <p>Selected: {file.name}</p>
            <button onClick={handleUpload}>Upload</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
