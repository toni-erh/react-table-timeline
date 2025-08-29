import { useState } from 'react';
import { Table } from '../src/Table';
import type { RowReorderEvent, TableColumn, TableRowBase } from '../src/types/tableTypes';
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

// Mock Data
const columns: TableColumn<Person>[] = [
  { field: 'id', header: 'ID', minWidth: 80 },
  { field: 'name', header: 'Name', flex: 2 },
  { field: 'age', header: 'Age', maxWidth: 50, align: 'right' },
  { field: 'city', header: 'City', width: 100, align: 'center', renderCell: (value: string) => <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '3px', margin: '5px', borderRadius: '8px' }}>{value}</div> },
];

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

const timeLineItems = [
  { id: '0', rowId: '1', startTime: 0, endTime: 100 },
  { id: '1', rowId: '2', startTime: 100, endTime: 200 },
  { id: '2', rowId: '4', startTime: 190, endTime: 250 },
  { id: '3', rowId: '2', startTime: 250, endTime: 300 },
];

export default function Playground() {
  const [isDark, setIsDark] = useState(false);

  const [loadedRows, setLoadedRows] = useState<typeof rows>(rows);

  const handleRowReorder = ({ sourceId, sourcePath, targetId, targetPath, placement }: RowReorderEvent) => {
    const newRows = structuredClone(loadedRows);
    const sourceParent = sourcePath.slice(0, sourcePath.length - 1).reduce((acc, id) => acc?.[acc?.findIndex(row => row.id === id)]?.children, newRows as TableRowBase[] | undefined);
    if (!sourceParent) return;
    const sourceIndex = sourceParent.findIndex(row => row.id === sourceId);
    const source = sourceParent.splice(sourceIndex, 1)[0];

    const targetParentChildren = targetPath.slice(0, targetPath.length - 1).reduce((acc, id) => acc?.[acc?.findIndex(row => row.id === id)]?.children, newRows as TableRowBase[] | undefined);
    const targetIndex = targetParentChildren?.findIndex(row => row.id === targetId);
    if (!targetParentChildren || targetIndex === undefined) return;
    if (placement === 'inside') {
      if (targetParentChildren[targetIndex].children) {
        targetParentChildren[targetIndex].children.unshift(source);
      } else {
        targetParentChildren[targetIndex].children = [source];
      }
    } else if (placement === 'before') {
      targetParentChildren.splice(targetIndex, 0, source);
    } else if (placement === 'after') {
      targetParentChildren.splice(targetIndex + 1, 0, source);
    }
    setLoadedRows(newRows);
  };

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
          rows={loadedRows}
          rowCount={loadedRows.length}
          columns={columns}
          // onRowRangeChange={({ firstFirstLevelIndex, lastFirstLevelIndex }) => setLoadedRows(rows.slice(firstFirstLevelIndex, lastFirstLevelIndex))}
          lineHeight={30}
          defaultExpansionDepth={1}
          rowVirtualizationMargin={0}
          renderSkeletonRow={CustomSkeletonRow}
          onRowReorder={handleRowReorder}
          showTimeLine={true}
          timeLineItems={timeLineItems}
          renderTimeLineItem={(item) => (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'lightblue' }}>
              {item.id}
            </div>
          )}
          minTime={-100}
          maxTime={700}
          initialVisibleTime={177}
        />
      </div>
    </div>
  );
};
