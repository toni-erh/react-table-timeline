# Table Component Theming

This document explains how to customize the appearance of the table component. There are multiple levels of customization available.

---

## Level 1: Basic Theming with CSS Variables

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

### Example: Dark Theme

To create a dark theme, wrap the `Table` component in a container with a `.dark-theme` class and override the variables in your CSS file.

```css
/* In your CSS file */
.dark-theme {
  --table-bg-color: #2a2a2a;
  --table-text-color: #e0e0e0;
  --table-header-bg-color: #3a3a3a;
  --table-border-color: #444;
  --table-row-hover-bg-color: #3c3c3c;
}
```

---

## Level 2: Advanced Customization with Render Props

For maximum flexibility, you can use render props to provide your own components for specific parts of the table. This allows you to completely control the markup and styling.

### `renderSkeletonRow`

Provide a function that returns a React Node to render a custom skeleton loading row.

- **Signature**: `() => React.ReactNode`
- **Responsibility**: You only need to define the *content* of the row. The table component automatically wraps your component in a container that handles the `key` and the correct `height` for virtualization.

#### Example

Here is how you can pass a custom, animated skeleton component.

```tsx
// 1. Define your custom component. It takes no props.
const MyCustomSkeleton = () => (
  <div style={{ padding: '4px', height: '100%', boxSizing: 'border-box' }}>
    <div 
      className="my-pulse-animation" 
      style={{ height: '100%', width: '100%', borderRadius: '4px' }}
    />
  </div>
);

// 2. Pass it to the Table component.
<Table
  rows={rows}
  columns={columns}
  renderSkeletonRow={MyCustomSkeleton}
/>
```

The table component uses CSS variables for its styling. You can easily override these variables in your own CSS to apply a custom theme. All you need to do is wrap the `Table` component in a container with a custom class and redefine the variables within that class.

## Available CSS Variables

Here is a list of all available variables and their default values:

| Variable                             | Default Value | Description                                      |
| ------------------------------------ | :-----------: | ------------------------------------------------ |
| `--table-bg`                         | `#fff`        | Background color of the entire table.            |
| `--table-border-color`               | `#ddd`        | Color of all borders (rows, header).             |
| `--table-border-width`               | `1px`         | Width of all borders.                            |
| `--table-text-color`                 | `#333`        | Default text color for all content.              |
| `--table-header-bg`                  | `#f8f8f8`     | Background color of the table header.            |
| `--table-row-hover-bg`               | `#f1f1f1`     | Background color of a row on hover.              |
| `--table-skeleton-bg`                | `lightgrey`   | Background color for skeleton loader rows.       |
| `--table-resize-handle-color`        | `#ddd`        | Color of the column resize handle.               |
| `--table-resize-handle-active-color` | `#aaa`        | Color of the resize handle when active or hovered. |
| `--table-line-height`                | (set by prop) | Height of each row. Set via `lineHeight` prop.   |
| `--table-cell-padding`               | `0 5px`       | Padding inside each table cell.                  |
| `--table-font-family`                | `sans-serif`  | The font family used in the table.               |
| `--table-font-size`                  | `14px`        | The base font size for the table content.        |

## Usage Example: Dark Theme

Here is a full example of how to create a dark theme, as demonstrated in the `Playground`.

1.  **Define your theme in CSS:**

    ```css
    /* In your application's CSS file */
    .dark-theme {
      --table-bg: #2a2a2a;
      --table-text-color: #f0f0f0;
      --table-border-color: #444;
      --table-header-bg: #333;
      --table-row-hover-bg: #3c3c3c;
      --table-skeleton-bg: #3f3f3f;
      --table-resize-handle-color: #555;
      --table-resize-handle-active-color: #888;
    }
    ```

2.  **Apply the class to a container:**

    ```tsx
    // In your React component
    import { Table } from 'your-table-library';

    const MyComponent = () => {
      return (
        <div className="dark-theme">
          <Table {...props} />
        </div>
      );
    };
    ```

This provides a flexible and simple way to integrate the table component seamlessly into your application's design system.
