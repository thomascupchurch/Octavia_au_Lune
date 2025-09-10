
import React from 'react';


import GanttChart from './GanttChart';
import FileUpload from './FileUpload';
import ProjectChooser from './ProjectChooser';
import ProjectStructure from './ProjectStructure';

import ComboLogo from './assets/LSI_Power_T_Combo_Logo.png';


import { useState } from 'react';


function App() {
  // Default structure: phase > feature > job > item (with valid dates)
  const today = new Date().toISOString().slice(0, 10);
  const defaultStructure = [
    {
      id: 'phase-1', type: 'phase', name: 'Phase 1', children: [
        {
          id: 'feature-1', type: 'feature', name: 'Feature 1', children: [
            {
              id: 'job-1', type: 'job', name: 'Job 1', children: [
                {
                  id: 'item-1', type: 'item', name: 'Item 1', start: today, end: today, progress: 0, children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  // Project structure state (per project, but for now global)
  const [structure, setStructure] = useState(defaultStructure);

  // Helper: flatten structure to Gantt tasks (items/milestones as main bars, summary bars for phase/feature/job)
  function getGanttTasks(structure) {
    const tasks = [];
    function walk(nodes, parentId = null) {
      for (const n of nodes) {
        if (['phase', 'feature', 'job'].includes(n.type)) {
          // Calculate summary bar start/end as min/max of all descendant items/milestones
          let allDates = [];
          function collectDates(children) {
            for (const c of children) {
              if (c.type === 'item' || c.type === 'milestone') {
                if (c.start) allDates.push(c.start);
                if (c.end) allDates.push(c.end);
              }
              if (c.children) collectDates(c.children);
            }
          }
          collectDates([n]);
          if (allDates.length > 0) {
            let start = allDates.reduce((a, b) => a < b ? a : b);
            let end = allDates.reduce((a, b) => a > b ? a : b);
            tasks.push({
              id: n.id,
              name: n.name || n.type.charAt(0).toUpperCase() + n.type.slice(1),
              start,
              end,
              progress: 0,
              dependencies: '',
              custom_class: 'gantt-bar-summary',
              parentId,
              isSummary: true,
            });
          }
        }
        if (n.type === 'item' || n.type === 'milestone') {
          tasks.push({
            id: n.id,
            name: n.name || (n.type === 'milestone' ? 'Milestone' : 'Untitled Item'),
            start: n.start || today,
            end: n.end || today,
            progress: n.type === 'item' ? (n.progress ?? 0) : 0,
            dependencies: Array.isArray(n.dependencies) ? n.dependencies.join(',') : (n.dependencies || ''),
            custom_class: n.type === 'milestone' ? 'gantt-bar-milestone' : 'gantt-bar-design',
            parentId,
          });
        }
        if (n.children) walk(n.children, n.id);
      }
    }
    walk(structure);
    return tasks;
  }

  // Sync Gantt edits back to structure
  function handleGanttTasksChange(newTasks) {
    setStructure(structure => {
      function updateItems(nodes) {
        return nodes.map(n => {
          if (n.type === 'item') {
            const t = newTasks.find(t => t.id === n.id);
            if (t) {
              return { ...n, start: t.start, end: t.end, progress: t.progress };
            }
          }
          return { ...n, children: updateItems(n.children) };
        });
      }
      return updateItems(structure);
    });
  }
  // Project management state
  const [projects, setProjects] = useState([
    { id: 1, name: 'Sample Project', data: { name: 'Sample Project', tasks: [] } }
  ]);
  const [currentProjectId, setCurrentProjectId] = useState(1);
  const [images, setImages] = useState([]); // Array of uploaded image filenames

  // Helper to get current project data
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];
  const setProjectData = (data) => {
    setProjects(projects => projects.map(p => p.id === currentProjectId ? { ...p, data } : p));
  };

  // Project management actions
  const handleAddProject = () => {
    const name = prompt('Enter new project name:');
    if (!name) return;
    const newId = Math.max(0, ...projects.map(p => p.id)) + 1;
    setProjects([...projects, { id: newId, name, data: { name, tasks: [] } }]);
    setCurrentProjectId(newId);
  };
  const handleDeleteProject = (id) => {
    if (projects.length === 1) return alert('At least one project must exist.');
    if (!window.confirm('Delete this project?')) return;
    setProjects(projects => projects.filter(p => p.id !== id));
    if (currentProjectId === id) {
      const next = projects.find(p => p.id !== id);
      setCurrentProjectId(next.id);
    }
  };
  const handleSelectProject = (id) => setCurrentProjectId(id);

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
        {/* Project Management Section */}
        <section style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 24, boxShadow: '0 2px 8px #0001' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold', fontSize: 18, color: '#4B4B4B' }}>Projects:</span>
            <select value={currentProjectId} onChange={e => handleSelectProject(Number(e.target.value))} style={{ fontSize: 16, padding: '4px 8px' }}>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={handleAddProject} style={{ background: '#FF8200', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 'bold' }}>Add</button>
            <button onClick={() => handleDeleteProject(currentProjectId)} style={{ background: '#4B4B4B', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 'bold' }}>Delete</button>
          </div>
        </section>
        <ProjectStructure structure={structure} setStructure={setStructure} />
        <ProjectChooser
          onSave={handleSaveZip}
          onOpen={handleOpenZip}
        />
        <FileUpload onUpload={files => {
          // Add uploaded image filenames to state
          setImages(imgs => [...imgs, ...files.map(f => f.filename)]);
        }} />
  <GanttChart
    tasks={getGanttTasks(structure)}
    onTasksChange={handleGanttTasksChange}
  />
        {/* Additional dashboard features will be added here */}
      </main>
      <footer style={{ textAlign: 'center', marginTop: 48, color: '#4B4B4B', opacity: 0.7 }}>
        Copyright 2025 © LSI Graphics, LLC. All Rights Reserved
      </footer>
    </div>
  );
}

export default App;
