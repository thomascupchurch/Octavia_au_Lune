import React, { useRef } from 'react';


const FileUpload = ({ onUpload }) => {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Uploaded ${data.files.length} file(s) successfully.`);
        if (onUpload) onUpload(data.files);
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    }
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <label style={{ color: '#4B4B4B', fontWeight: 'bold' }}>
        Upload Images or PDFs:
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          ref={fileInputRef}
          style={{ display: 'block', marginTop: 8 }}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FileUpload;
