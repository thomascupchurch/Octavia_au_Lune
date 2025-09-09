
import React from 'react';


import GanttChart from './GanttChart';
import FileUpload from './FileUpload';
import ProjectChooser from './ProjectChooser';

import ComboLogo from './assets/LSI_Power_T_Combo_Logo.png';


import { useState } from 'react';

function App() {
  // Example state for project data and images
  const [projectData, setProjectData] = useState({
    name: 'Sample Project',
    tasks: [],
    // ...other project fields
  });
  const [images, setImages] = useState([]); // Array of uploaded image filenames

  // Save project as zip
  const handleSaveZip = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/save-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData, images }),
      });
      if (!res.ok) throw new Error('Failed to save zip');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error saving zip: ' + err.message);
    }
  };

  // Open project from zip
  const handleOpenZip = async (file) => {
    try {
      const formData = new FormData();
      formData.append('zipfile', file);
      const res = await fetch('http://localhost:5000/api/open-zip', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to open zip');
      const data = await res.json();
      setProjectData(data.projectData || {});
      setImages(data.images || []);
      alert('Project loaded from zip!');
    } catch (err) {
      alert('Error opening zip: ' + err.message);
    }
  };

  return (
  <div className="App" style={{ background: '#4B4B4B', minHeight: '100vh', padding: 32 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          padding: 16,
          borderBottom: '1px solid #eee',
          gap: 32,
        }}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={ComboLogo} alt="LSI Power T Combo Logo" style={{ height: 120, objectFit: 'contain' }} />
        </div>
      </header>
      <main style={{ marginTop: 32 }}>
        <ProjectChooser
          onSave={handleSaveZip}
          onOpen={handleOpenZip}
        />
        <FileUpload onUpload={files => {
          // Add uploaded image filenames to state
          setImages(imgs => [...imgs, ...files.map(f => f.filename)]);
        }} />
        <GanttChart />
        {/* Additional dashboard features will be added here */}
      </main>
      <footer style={{ textAlign: 'center', marginTop: 48, color: '#4B4B4B', opacity: 0.7 }}>
        Copyright 2025 © LSI Graphics, LLC. All Rights Reserved
      </footer>
    </div>
  );
}

export default App;
