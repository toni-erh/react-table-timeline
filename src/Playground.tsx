import { useState } from 'react';
import { Table } from './Table';
import './Playground.css';

// Custom Skeleton Row Component for demonstration
const CustomSkeletonRow = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      padding: '3px',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite ease-in-out',
      }}
    />
  </div>
);
import type { TableRowBase } from './types/tableTypes';

// Mock Data
const columns = ['id', 'name', 'age', 'city'];

// This interface must be compatible with TableRowBase
interface Person extends TableRowBase {
  id: string;
  index: number; // Required by the virtualization logic
  name: string;
  age: number;
  city: string;
}

const generateData = (count: number, depth: number, parentId: string = ''): Person[] => {
  const data: Person[] = [];
  for (let i = 1; i <= count; i++) {
    const id = parentId !== '' ? parentId + '-' + i.toString() : i.toString();
    data.push({
      id,
      index: i - 1, // Add the index property
      name: `Person ${i}`,
      age: Math.floor(Math.random() * 40) + 20,
      city: `City ${i % 10}`,
      ...(depth > 0 && i > 1 && i % 5 === 1 ? { children: generateData(5, depth - 1, id) } : {}),
    });
  }
  return data;
};

const rows = generateData(100, 1);

export default function Playground() {
  const [isDark, setIsDark] = useState(false);

  const themeClass = isDark ? 'dark-theme' : '';

  return (
    <div className={`playground-container ${themeClass}`}>
      <h1>React Table Playground</h1>
      <div className="playground-controls">
        <button onClick={() => setIsDark(!isDark)}>
          Toggle Dark Mode
        </button>
      </div>
      <div className="table-wrapper">
        <Table<Person>
          rows={rows}
          rowCount={rows.length}
          columns={columns}
          lineHeight={30}
          defaultExpansionDepth={1}
          renderSkeletonRow={CustomSkeletonRow}
        />
      </div>
    </div>
  );
};