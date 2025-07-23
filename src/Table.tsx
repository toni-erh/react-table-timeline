import React from "react";

type TableRowBase = { index: number }

export interface TableProps<TableRow extends TableRowBase> {
  columns: string[];
  data: Array<TableRow>;
  lineHeight?: number;
}

export const Table = <TableRow extends TableRowBase = TableRowBase>({ columns, data, lineHeight = 20 }: TableProps<TableRow>) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const scrollBodyRef = React.useRef<HTMLDivElement>(null)

  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const rowCountToRender = React.useMemo(() => Math.ceil(containerHeight / lineHeight), [containerHeight])
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setContainerHeight(container.clientHeight);
    }
  }, []);

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => setFirstRenderedIndex(Math.floor(container.scrollTop / lineHeight));
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: `${lineHeight}px` }}>
        {columns.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflow: 'scroll', height: `calc(100% - ${lineHeight}px)` }}>

        <div ref={scrollBodyRef} style={{ height: `${(data.length - firstRenderedIndex) * lineHeight}px`, paddingTop: `${firstRenderedIndex * lineHeight}px` }}>
          {data.slice(firstRenderedIndex, firstRenderedIndex + rowCountToRender).map((row) => (
            <div key={row.index} style={{ height: `${lineHeight}px` }}>
              {columns.map((col) => (
                <div key={col}>{row[col as keyof TableRow] as React.ReactNode}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
