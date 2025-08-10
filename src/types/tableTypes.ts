export type TableRowBase = { 
  index: number; 
  id: string; 
  children?: TableRowBase[]; 
}

export type TableSceletonRow = { 
  __sceleton_row: true; 
}

export type RowExpansions = { 
  [rowId: number]: RowExpansions; 
}

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

export interface TableProps<TableRow extends TableRowBase> {
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (requestedRows: RequestedRows) => void;
  lineHeight?: number;
  rowVirtualizationMargin?: number;
  defaultExpansionDepth?: number;
}
