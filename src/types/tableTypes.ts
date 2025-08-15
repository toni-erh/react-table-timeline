export type TableRowBase = { 
  index: number; 
  id: string; 
  children?: TableRowBase[]; 
}

export type TableSceletonRow = { 
  __sceleton_row: true; 
}

export type PreparedRow<TableRow extends TableRowBase> = TableRow | TableSceletonRow;

export type RowExpansions = Map<string, { isExpanded: boolean, childrenIds: string[], parentId: string | undefined }>

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

export type RenderExpanderParams<TableRow extends TableRowBase> = {
  expanded: boolean;
  hasChildren: boolean;
  toggle: () => void;
  level: number;
  row: TableRow;
}

export interface TableProps<TableRow extends TableRowBase> extends React.HTMLAttributes<HTMLDivElement> {
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (requestedRows: RequestedRows) => void;
  lineHeight?: number;
  rowVirtualizationMargin?: number;
  defaultExpansionDepth?: number;
  renderSkeletonRow?: () => React.ReactNode;
  renderExpander?: (params: RenderExpanderParams<TableRow>) => React.ReactNode;
}
