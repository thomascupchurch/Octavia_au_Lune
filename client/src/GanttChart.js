import React, { useRef, useEffect } from 'react';
import { FrappeGantt } from 'frappe-gantt-react';



const GanttChart = ({ tasks = [], onTasksChange }) => {
  const ganttRef = useRef();

  useEffect(() => {
    // Custom styling for bars
    const style = document.createElement('style');
    style.innerHTML = `
      .gantt-bar-design { fill: #FF8200 !important; }
      .gantt-bar-dev { fill: #4B4B4B !important; }
      .gantt-bar-test { fill: #FF8200 !important; opacity: 0.7; }
      .gantt-bar-milestone { fill: #fff !important; stroke: #FF8200 !important; stroke-width: 3px; }
      .gantt-bar-summary {
        fill: #4B4B4B !important;
        opacity: 0.18 !important;
        stroke: #4B4B4B !important;
        stroke-width: 2px !important;
        stroke-dasharray: 6,3 !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ border: '2px solid #FF8200', borderRadius: 8, padding: 24, background: '#fff', color: '#4B4B4B' }}>
      <h2 style={{ color: '#FF8200' }}>Gantt Chart</h2>
      <FrappeGantt
        ref={ganttRef}
        tasks={tasks}
        viewMode="Day"
        onClick={task => alert(`Clicked: ${task.name}`)}
        onDateChange={(task, start, end) => {
          if (onTasksChange) {
            const updated = tasks.map(t => t.id === task.id ? { ...t, start, end } : t);
            onTasksChange(updated);
          }
        }}
        onProgressChange={(task, progress) => {
          if (onTasksChange) {
            const updated = tasks.map(t => t.id === task.id ? { ...t, progress } : t);
            onTasksChange(updated);
          }
        }}
        onTasksChange={onTasksChange}
      />
    </div>
  );
};

export default GanttChart;
