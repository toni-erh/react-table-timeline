export type TableColumn<RowType extends TableRowBase = any> = {
  field: string;
  header?: React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: any, row: RowType) => React.ReactNode;
};

export type TableRowBase = {
  // TODO: can we replace this with a firstRowIndex prop in the TableProps?
  index: number;
  id: string;
  children?: TableRowBase[];
}

export type TimeLineItem = {
    id: string,
    rowId: string,
    startTime: number,
    endTime: number,
}

export type TableSkeletonRow = {
  __skeleton_row: true;
}

export type PreparedRow<TableRow extends TableRowBase> = TableRow | TableSkeletonRow;

export type RowExpansionData = {
  isExpanded: boolean;
  childrenIds: string[];
  parentId: string | undefined;
  prevSiblingId: string | undefined;
  nextSiblingId: string | undefined;
};
export type RowExpansions = Map<string, RowExpansionData>;

export type ExpandedChildCounts = {
  index: number;
  rowCount: number;
}[]

export type RequestedRows = {
  firstFirstLevelIndex: number;
  lastFirstLevelIndex: number;
  firstLevelRowCount: number;
  rowExpansions: RowExpansions;
};

export type RowSelectionMode = 'single' | 'multiple' | 'none';

export type RowSelectionState = Set<string>;

export interface RowSelectionChangeEvent {
  selectedRows: Set<string>;
  changedRow: string;
  action: 'select' | 'deselect';
}

export type RowReorderPlacement = 'before' | 'after' | 'inside';

export interface RowReorderEvent {
  sourceId: string;
  sourceParentId?: string;
  sourcePath: string[];

  targetId: string;
  targetParentId?: string;
  targetPath: string[];

  placement: RowReorderPlacement;

  newParentId?: string;
  prevSiblingId?: string;
  nextSiblingId?: string;

  isSameParentMove: boolean;
}

export type RenderExpanderParams<TableRow extends TableRowBase> = {
  expanded: boolean;
  hasChildren: boolean;
  toggle: () => void;
  level: number;
  row: TableRow;
};

export interface TableProps<TableRow extends TableRowBase> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The configuration for the table columns.
   * @example [{ field: 'id' }, { field: 'name' }]
   */
  columns: TableColumn<TableRow>[];
  /**
   * The data to be displayed in the table.
   * For virtualized tables, this is a partial dataset.
   */
  rows: TableRow[];
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
  /**
   * Whether to show the time line.
   */
  showTimeLine?: boolean;
  /**
   * The time line items to be displayed in the table.
   */
  timeLineItems?: TimeLineItem[];
  /**
   * A render function for time line items.
   */
  renderTimeLineItem?: (item: TimeLineItem) => React.ReactNode;
  /**
   * The minimum time value for the time line.
   */
  minTime?: number,
  /**
   * The maximum time value for the time line.
   */
  maxTime?: number,
  /**
   * The initial start time which is visible in the time line.
   */
  initialVisibleTime?: number,
  /**
   * The selection mode for the table rows.
   * - 'none': No selection allowed
   * - 'single': Only one row can be selected at a time
   * - 'multiple': Multiple rows can be selected
   * @default 'none'
   */
  selectionMode?: RowSelectionMode;
  /**
   * The currently selected row IDs (controlled mode).
   * When provided, the component is in controlled mode.
   */
  selectedRows?: Set<string>;
  /**
   * The initial selected row IDs (uncontrolled mode).
   * Used when the component is in uncontrolled mode.
   */
  defaultSelectedRows?: Set<string>;
  /**
   * Callback function invoked when the selection changes.
   */
  onSelectionChange?: (event: RowSelectionChangeEvent) => void;
}
