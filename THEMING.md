# Table Component Theming

This document explains how to customize the look and feel of the table component using CSS variables.

## Core Concept

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
