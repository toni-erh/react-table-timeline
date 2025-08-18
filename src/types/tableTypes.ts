export type TableRowBase = { 
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
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (requestedRows: RequestedRows) => void;
  onRowReorder?: (event: RowReorderEvent) => void;
  lineHeight?: number;
  rowVirtualizationMargin?: number;
  rowVirtualizationStep?: number;
  defaultExpansionDepth?: number;
  renderSkeletonRow?: () => React.ReactNode;
  renderExpander?: (params: RenderExpanderParams<TableRow>) => React.ReactNode;
}
