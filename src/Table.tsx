import type { TableRowBase, TableProps } from './types/tableTypes';
import { useColumnResize } from './hooks/useColumnResize';
import { useTreeExpansion } from './hooks/useTreeExpansion';
import { useVirtualization } from './hooks/useVirtualization';
import { useRowSelection } from './hooks/useRowSelection';
import { useScrollSync } from './hooks/useScrollSync';
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import { ResizeHandle } from './components/ResizeHandle';
import './Table.css';
import { RowExpansionProvider } from './context/RowExpansionContext';
import { TimeLineBody } from './components/TimeLineBody';
import { RowSelectionProvider } from './context/RowSelectionContext';

export const Table = <TableRow extends TableRowBase = TableRowBase>({
  columns,
  rows,
  rowCount,
  onRowRangeChange,
  onRowReorder,
  dragHandleWidth = 20,
  defaultMinColumnWidth = 30,
  lineHeight = 20,
  rowVirtualizationMargin = 5,
  rowVirtualizationStep = 5,
  defaultExpansionDepth,
  className,
  style,
  renderSkeletonRow,
  renderExpander,
  showTimeLine,
  timeLineItems,
  renderTimeLineItem,
  minTime,
  maxTime,
  initialVisibleTime,
  selectionMode = 'none',
  selectedRows,
  defaultSelectedRows,
  onSelectionChange,
}: TableProps<TableRow>) => {
  const { rowExpansions, setRowExpansions, expandedChildCounts, expandedRowCount, flatRows } =
    useTreeExpansion(rows, rowCount, defaultExpansionDepth);

  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualization(
    flatRows,
    rowCount,
    expandedRowCount,
    lineHeight,
    rowVirtualizationMargin,
    rowVirtualizationStep,
    expandedChildCounts,
    rowExpansions,
    onRowRangeChange,
  );

  const { leftWidth, isResizing, startResize } = useColumnResize(scrollContainerRef, 300);

  const {
    selectedRows: currentSelectedRows,
    selectRow,
    deselectRow,
    toggleRow,
    clearSelection,
    isSelected,
  } = useRowSelection(selectionMode, selectedRows, defaultSelectedRows, onSelectionChange);

  const { headerRef, bodyRef } = useScrollSync();

  const containerStyle = {
    ...style,
    '--table-line-height': `${lineHeight}px`,
    '--drag-handle-width': `${dragHandleWidth}px`,
  };

  return (
    <RowExpansionProvider rowExpansions={rowExpansions} setRowExpansions={setRowExpansions}>
      <RowSelectionProvider
        selectionMode={selectionMode}
        selectedRows={currentSelectedRows}
        selectRow={selectRow}
        deselectRow={deselectRow}
        toggleRow={toggleRow}
        clearSelection={clearSelection}
        isSelected={isSelected}
      >
        <div className={`table-container ${className || ''}`} style={containerStyle}>
          <TableHeader
            columns={columns}
            leftWidth={showTimeLine ? leftWidth : undefined}
            showDragColumn={!!onRowReorder}
            scrollRef={headerRef}
          />
          <div
            ref={scrollContainerRef}
            style={{ overflowY: 'auto', height: `calc(100% - ${lineHeight}px)`, display: 'flex' }}
          >
            <div
              ref={bodyRef}
              className="table-body-wrapper"
              style={{
                height: `${expandedRowCount * lineHeight}px`,
                paddingTop: `${firstRenderedIndex * lineHeight}px`,
                boxSizing: 'border-box',
                width: showTimeLine ? leftWidth : '100%',
                minWidth: showTimeLine ? 50 : undefined,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent calc(var(--table-line-height) - var(--table-border-width)), var(--table-border-color) var(--table-border-width), var(--table-border-color) var(--table-line-height))`,
                overflowY: 'auto',
              }}
            >
              <TableBody
                preparedRows={preparedRows}
                columns={columns}
                lineHeight={lineHeight}
                renderSkeletonRow={renderSkeletonRow}
                renderExpander={renderExpander}
                showDragHandle={!!onRowReorder}
                onRowReorder={onRowReorder}
                dragHandleWidth={dragHandleWidth}
                defaultMinColumnWidth={defaultMinColumnWidth}
              />
            </div>
            {showTimeLine && (
              <div
                style={{
                  height: `${expandedRowCount * lineHeight}px`,
                  paddingTop: `${firstRenderedIndex * lineHeight}px`,
                  boxSizing: 'border-box',
                  width: `calc(100% - ${leftWidth}px)`,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent calc(var(--table-line-height) - var(--table-border-width)), var(--table-border-color) var(--table-border-width), var(--table-border-color) var(--table-line-height))`,
                }}
              >
                <TimeLineBody
                  preparedRows={preparedRows}
                  timeLineItems={timeLineItems}
                  renderTimeLineItem={renderTimeLineItem}
                  minTime={minTime}
                  maxTime={maxTime}
                  initialVisibleTime={initialVisibleTime}
                />
              </div>
            )}
          </div>
          {showTimeLine && (
            <ResizeHandle isResizing={isResizing} leftWidth={leftWidth} startResize={startResize} />
          )}
        </div>
      </RowSelectionProvider>
    </RowExpansionProvider>
  );
};
