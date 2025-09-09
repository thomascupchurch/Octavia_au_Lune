import React, { useRef } from 'react';

const ProjectChooser = ({ onOpen, onSave }) => {
  const fileInputRef = useRef();

  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (file && onOpen) onOpen(file);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <button onClick={onSave} style={{ background: '#FF8200', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontWeight: 'bold' }}>
        Save Project as Zip
      </button>
      <input
        type="file"
        accept=".zip"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleOpen}
      />
      <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ background: '#4B4B4B', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontWeight: 'bold' }}>
        Open Project Zip
      </button>
    </div>
  );
};

export default ProjectChooser;
