# React Table+Timeline Component

This should become a performant, highly customizable, and react-friendly table component with optional timeline support, built with TypeScript. It's designed to handle large datasets with ease, supporting virtualization and lazy loading, while not being tied to any specific data management solution.

## Features

- **React First**: Supports direct data binding for a perfect integration with your data management solution. No internal data layer with complex synchronization.
- **High Performance**: Uses row virtualization to render only the visible rows, enabling smooth scrolling with thousands of items.
- **Tree Data Support**: Natively displays hierarchical data with expand/collapse functionality.
- **Lazy Loading**: Efficiently loads data on demand as the user scrolls, perfect for very large or remote datasets.
- **Drag & Drop Reordering**: Supports reordering of rows within the table.
- **Customizable Rendering**: Use custom render functions for maximum flexibility.
- **Theming**: Use CSS variables for easy theming.
- **TypeScript**: Written entirely in TypeScript for a great developer experience with strong type safety.

## Basic Usage

Here's a simple example of how to use the `Table` component:

```tsx
const columns = ['name', 'type', 'size'];
const data = [
  { id: '1', index: 0, name: 'Folder 1', type: 'folder', size: '100KB', children: [
    { id: '2', index: 0, name: 'File 1.txt', type: 'text file', size: '100KB' },
  ] },
  { id: '3', index: 1, name: 'File 2.png', type: 'image file', size: '16MB' },
];

const App = () => {
  return (
    <Table
      columns={columns}
      rows={data}
      rowCount={data.length}
    />
  );
};
```

## API - Component Props

The `Table` component accepts the following props:

| Prop                      | Type                                                  | Default | Description                                                                                             |
| ------------------------- | ----------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `columns`                 | `string[]`                                            | -       | The configuration for the table columns. Example: `['Column 1', 'Column 2']`                              |
| `rows`                    | `Array<TableRow>`                                     | -       | The data to be displayed. For virtualized tables, this is a partial dataset.                            |
| `rowCount`                | `number`                                              | -       | The total number of rows in the dataset, including those not currently loaded.                          |
| `onRowRangeChange`        | `((requestedRows: RequestedRows) => void)` \| `undefined` | -       | Callback invoked when the visible row range changes. Used for lazy loading.                             |
| `onRowReorder`            | `((event: RowReorderEvent) => void)` \| `undefined`     | -       | Callback for handling row drag-and-drop reordering. If provided, drag handles are rendered.             |
| `lineHeight`              | `number`                                              | `20`    | The height of each row in pixels.                                                                       |
| `rowVirtualizationMargin` | `number`                                              | `5`     | The number of rows to render outside the visible viewport to reduce flickering during scrolling.        |
| `rowVirtualizationStep`   | `number`                                              | `5`     | The number of rows to fetch in each lazy loading request.                                               |
| `defaultExpansionDepth`   | `number` \| `undefined`                               | -       | The initial depth to which tree nodes are expanded. `0` = collapsed, `undefined` = all expanded.       |
| `renderSkeletonRow`       | `(() => React.ReactNode)` \| `undefined`                 | -       | A function to render a placeholder row while data is loading.                                           |
| `renderExpander`          | `((params: RenderExpanderParams) => React.ReactNode)` \| `undefined` | -       | A custom render function for the expand/collapse control in tree view.                                  |

## Data Types

This section provides details on the core data structures used by the table component.

### `TableRow`

Your data objects passed in the `rows` prop must conform to the `TableRowBase` interface.

```typescript
type TableRowBase = {
  // A unique identifier for the row.
  id: string;

  // The current index of the row in its parent's children array.
  index: number;

  // An optional array of child rows for creating a tree structure.
  children?: TableRowBase[];
}
```

You can extend this type with any custom properties your application needs:
```typescript
interface MyDataRow extends TableRowBase {
  name: string;
  size: number;
  lastModified: Date;
}
```

### `RequestedRows`

This object is passed to the `onRowRangeChange` callback and contains information about the data range required by the virtualized view.

```typescript
type RequestedRows = {
  // The first index of the top-level rows required.
  firstFirstLevelIndex: number;
  // The last index of the top-level rows required.
  lastFirstLevelIndex: number;
  // The total count of top-level rows.
  firstLevelRowCount: number;
  // A map containing the expansion state of all currently known rows.
  rowExpansions: Map<string, RowExpansionData>;
}
```

### `RowReorderEvent`

The `onRowReorder` callback receives this event object, describing the drag-and-drop operation.

```typescript
interface RowReorderEvent {
  // The ID of the row being dragged.
  sourceId: string;
  // The ID of the target row where the source is being dropped.
  targetId: string;
  // Describes where the source is dropped relative to the target: 'before', 'after', or 'inside'.
  placement: 'before' | 'after' | 'inside';

  // Additional context about the source and target locations.
  sourceParentId?: string;
  sourcePath: string[];
  targetParentId?: string;
  targetPath:string[];

  // Derived information for convenience.
  newParentId?: string;
  isSameParentMove: boolean;

  // Sibling IDs for deterministic placement in your data source.
  prevSiblingId?: string;
  nextSiblingId?: string;
}
```

### `RenderExpanderParams`

The `renderExpander` function receives an object with these parameters.

```typescript
type RenderExpanderParams = {
  // Whether the current row is expanded.
  expanded: boolean;
  // Whether the row has child nodes.
  hasChildren: boolean;
  // A function to call to toggle the expansion state.
  toggle: () => void;
  // The nesting depth of the row (0 for root).
  level: number;
  // The data for the current row.
  row: TableRow;
}
```

## Theming & Styling

Styling is done via CSS variables and render props, allowing for easy customization and high flexibility. For a detailed guide on how to customize the appearance of the table, please see [THEMING.md](./THEMING.md).
