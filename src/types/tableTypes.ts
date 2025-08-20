export type TableRowBase = { 
  // TODO: can we replace this with a firstRowIndex prop in the TableProps?
  index: number; 
  id: string; 
  children?: TableRowBase[]; 
}

export type TableSceletonRow = { 
  __sceleton_row: true; 
}

export type PreparedRow<TableRow extends TableRowBase> = TableRow | TableSceletonRow;

export type RowExpansionData = { 
  isExpanded: boolean, 
  childrenIds: string[], 
  parentId: string | undefined, 
  prevSiblingId: string | undefined, 
  nextSiblingId: string | undefined 
}
export type RowExpansions = Map<string, RowExpansionData>

export type ExpandedChildCounts = { 
  index: number; 
  rowCount: number; 
}[]

export type RequestedRows = {
  firstFirstLevelIndex: number;
  lastFirstLevelIndex: number;
  firstLevelRowCount: number;
  rowExpansions: RowExpansions;
}

// Drag & Drop types
export type RowReorderPlacement = 'before' | 'after' | 'inside';

export interface RowReorderEvent {
  // source
  sourceId: string;
  sourceParentId?: string;
  sourcePath: string[];

  // target
  targetId: string;
  targetParentId?: string;
  targetPath: string[];

  // drop intent
  placement: RowReorderPlacement;

  // derived
  newParentId?: string;

  // neighborhood for deterministic placement, independent from indexes
  prevSiblingId?: string;
  nextSiblingId?: string;

  // hints
  isSameParentMove: boolean;
}

export type RenderExpanderParams<TableRow extends TableRowBase> = {
  expanded: boolean;
  hasChildren: boolean;
  toggle: () => void;
  level: number;
  row: TableRow;
}

export interface TableProps<TableRow extends TableRowBase> extends React.HTMLAttributes<HTMLDivElement> {
    /** 
     * The configuration for the table columns.
     * @example ['Column 1', 'Column 2']
     */
    columns: string[];
    /** 
     * The data to be displayed in the table. 
     * For virtualized tables, this is a partial dataset.
     */
    rows: Array<TableRow>;
    /** 
     * The total number of rows in the dataset, including those not currently loaded.
     * 
     * For nested data, only the top level rows are counted.
     */
    rowCount: number;
    /** 
     * Callback function that is invoked when the visible row range changes due to scrolling.
     * 
     * This can be used for lazy loading data.
     */
    onRowRangeChange?: (requestedRows: RequestedRows) => void;
    /** 
     * Callback function for handling row drag-and-drop reordering.
     * 
     * If provided, drag handles will be rendered.
     */
    onRowReorder?: (event: RowReorderEvent) => void;
    /** 
     * The height of each row in pixels.
     * @default 20
     */
    lineHeight?: number;
    /** 
     * The number of rows to render outside the visible viewport to reduce flickering during scrolling.
     * @default 5
     */
    rowVirtualizationMargin?: number;
    /**
     * The step size in which the onRowRangeChange callback is invoked.
     * @default 5
     */
    rowVirtualizationStep?: number;
    /** 
     * The initial depth to which tree nodes are expanded by default.
     * - `0` means all nodes are collapsed.
     * - `1` means root nodes are expanded, etc.
     * - `undefined` or `Infinity` means all nodes are expanded.
     */
    defaultExpansionDepth?: number;
    /** 
     * A function to override the default render function for a placeholder row while data is being loaded.
     */
    renderSkeletonRow?: () => React.ReactNode;
    /** 
     * A custom render function for overriding the default expand/collapse control in tree view.
     */
    renderExpander?: (params: RenderExpanderParams<TableRow>) => React.ReactNode;
  }
