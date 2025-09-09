import React, { useRef, useEffect } from 'react';
import { FrappeGantt } from 'frappe-gantt-react';

const tasks = [
  {
    id: 'Task 1',
    name: 'Design',
    start: '2025-09-01',
    end: '2025-09-10',
    progress: 30,
    dependencies: '',
    custom_class: 'gantt-bar-design',
  },
  {
    id: 'Task 2',
    name: 'Development',
    start: '2025-09-11',
    end: '2025-09-20',
    progress: 10,
    dependencies: 'Task 1',
    custom_class: 'gantt-bar-dev',
  },
  {
    id: 'Task 3',
    name: 'Testing',
    start: '2025-09-21',
    end: '2025-09-25',
    progress: 0,
    dependencies: 'Task 2',
    custom_class: 'gantt-bar-test',
  },
];

const GanttChart = () => {
  const ganttRef = useRef();

  useEffect(() => {
    // Custom styling for bars
    const style = document.createElement('style');
    style.innerHTML = `
      .gantt-bar-design { fill: #FF8200 !important; }
      .gantt-bar-dev { fill: #4B4B4B !important; }
      .gantt-bar-test { fill: #FF8200 !important; opacity: 0.7; }
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
        onDateChange={(task, start, end) => console.log('Date changed', task, start, end)}
        onProgressChange={(task, progress) => console.log('Progress changed', task, progress)}
        onTasksChange={tasks => console.log('Tasks changed', tasks)}
      />
    </div>
  );
};

export default GanttChart;
