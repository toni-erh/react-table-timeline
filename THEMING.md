# Table Component Theming

This document explains how to customize the appearance of the table component. There are two main levels of customization available: overriding CSS variables for simple theme changes, and using render props for advanced structural modifications.

---

## Basic Theming with CSS Variables

The easiest way to theme the table is by overriding the default CSS variables. You can apply a class to a parent container and define your custom values there.

### Available CSS Variables

| Variable                             | Default Value | Description                                                    |
| ------------------------------------ | ------------- | -------------------------------------------------------------- |
| `--table-bg-color`                   | `#ffffff`     | Background color of the table container.                       |
| `--table-text-color`                 | `#333333`     | Default text color for table content.                          |
| `--table-font-family`                | `sans-serif`  | Font family used in the table.                                 |
| `--table-font-size`                  | `14px`        | Font size for table content.                                   |
| `--table-line-height`                | `20px`        | The height of each row. **Important for virtualization.**      |
| `--table-header-bg-color`            | `#f8f8f8`     | Background color of the header row.                            |
| `--table-header-text-color`          | `#333333`     | Text color for the header.                                     |
| `--table-border-color`               | `#e0e0e0`     | Color of the row and column borders.                           |
| `--table-border-width`               | `1px`         | Width of the row and column borders.                           |
| `--table-row-hover-bg-color`         | `#f1f1f1`     | Background color of a row on hover.                            |
| `--table-resize-handle-color`        | `#cccccc`     | Color of the column resize handle.                             |
| `--table-resize-handle-active-color` | `#a0a0a0`     | Color of the resize handle when active or hovered.             |
| `--table-skeleton-bg-color`          | `#e0e0e0`     | Base color for the default skeleton loading animation.         |
| `--tree-indent-step`                 | `12px`        | The indentation step for each level in a hierarchical tree.    |

### Example: Dark Theme

To create a dark theme, wrap the `Table` component in a container with a `.dark-theme` class and override the variables in your CSS file.

```css
/* In your application's CSS file */
.dark-theme {
  --table-bg-color: #2a2a2a;
  --table-text-color: #e0e0e0;
  --table-header-bg-color: #3a3a3a;
  --table-border-color: #444;
  --table-row-hover-bg-color: #3c3c3c;
  --table-skeleton-bg-color: #3f3f3f;
}
```

```tsx
// In your React component
<div className="dark-theme">
  <Table {...props} />
</div>
```

---

## Advanced Customization with Render Props

For maximum flexibility, you can use render props to provide your own components for specific parts of the table. This allows you to completely control the markup and styling.

### `renderSkeletonRow`

Provide a function that returns a React Node to render a custom skeleton loading row.

- **Signature**: `() => React.ReactNode`
- **Example**:
  ```tsx
  const MyCustomSkeleton = () => (
    <div className="my-pulse-animation" />
  );

  <Table renderSkeletonRow={MyCustomSkeleton} />
  ```

### `renderExpander`

Provide a function to render a custom expand/collapse icon for tree rows.

- **Signature**: `(params: { expanded: boolean; hasChildren: boolean; toggle: () => void; level: number; row: TableRow }) => React.ReactNode`
- **Parameters**:
  - `expanded`: `boolean` - Whether the current row is expanded.
  - `hasChildren`: `boolean` - Whether the row has child nodes.
  - `toggle`: `() => void` - A function to call to toggle the expansion state.
  - `level`: `number` - The nesting depth of the row.
  - `row`: `TableRow` - The data for the current row.

- **Example**:
  ```tsx
  const CustomExpander = ({ expanded, hasChildren, toggle }) => {
    if (!hasChildren) return <span style={{ width: '24px' }} />;
    return <button onClick={toggle}>{expanded ? '[-]' : '[+]'}</button>;
  };

  <Table renderExpander={CustomExpander} />
  ```
