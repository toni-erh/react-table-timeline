import type { TableRowBase, TableProps } from "./types/tableTypes";
import { useColumnResize } from "./hooks/useColumnResize";
import { useTreeExpansion } from "./hooks/useTreeExpansion";
import { useVirtualization } from "./hooks/useVirtualization";
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import { ResizeHandle } from './components/ResizeHandle';
import './Table.css';
import { RowExpansionProvider } from './context/RowExpansionContext';

export const Table = <TableRow extends TableRowBase = TableRowBase>({
  columns,
  rows,
  rowCount,
  onRowRangeChange,
  onRowReorder,
  onCanDrop,
  lineHeight = 20,
  rowVirtualizationMargin = 5,
  defaultExpansionDepth,
  className,
  style,
  renderSkeletonRow,
  renderExpander,
}: TableProps<TableRow>) => {
  // Use table expansion hook for tree functionality
  const {
    rowExpansions,
    setRowExpansions,
    expandedChildCounts,
    expandedRowCount,
    flatRows
  } = useTreeExpansion(rows, rowCount, defaultExpansionDepth);

  // Use virtualization hook
  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualization(
    flatRows,
    rowCount,
    expandedRowCount,
    lineHeight,
    rowVirtualizationMargin,
    expandedChildCounts,
    rowExpansions,
    onRowRangeChange
  );
  
  // Use column resize hook
  const { leftWidth, isResizing, handleMouseDown } = useColumnResize(scrollContainerRef, 300);

  const containerStyle = {
    ...style,
    '--table-line-height': `${lineHeight}px`,
  };

  return (
    <RowExpansionProvider rowExpansions={rowExpansions} setRowExpansions={setRowExpansions}>
      <div className={`table-container ${className || ''}`} style={containerStyle}>
        <TableHeader columns={columns} leftWidth={leftWidth} showDragColumn={!!onRowReorder} />
        <div ref={scrollContainerRef} style={{ overflowY: 'auto', height: `calc(100% - ${lineHeight}px)`, display: 'flex' }}>
          <div style={{
            height: `${(expandedRowCount - firstRenderedIndex) * lineHeight}px`,
            paddingTop: `${firstRenderedIndex * lineHeight}px`,
            width: leftWidth,
            minWidth: 50,
            maxWidth: 800,
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent calc(var(--table-line-height) - var(--table-border-width)), var(--table-border-color) var(--table-border-width), var(--table-border-color) var(--table-line-height))`
          }}>
            <TableBody
              preparedRows={preparedRows}
              columns={columns}
              lineHeight={lineHeight}
              renderSkeletonRow={renderSkeletonRow}
              renderExpander={renderExpander}
              showDragHandle={!!onRowReorder}
              onRowReorder={onRowReorder}
              onCanDrop={onCanDrop}
            />
          </div>
          <div
            style={{
              height: `${(expandedRowCount - firstRenderedIndex) * lineHeight}px`,
              paddingTop: `${firstRenderedIndex * lineHeight}px`,
              width: `calc(100% - ${leftWidth}px)`,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent calc(var(--table-line-height) - var(--table-border-width)), var(--table-border-color) var(--table-border-width), var(--table-border-color) var(--table-line-height))`
            }}
          >
          </div>
        </div>
        <ResizeHandle 
          isResizing={isResizing} 
          leftWidth={leftWidth} 
          handleMouseDown={handleMouseDown} 
        />
      </div>
    </RowExpansionProvider>
  );
};
