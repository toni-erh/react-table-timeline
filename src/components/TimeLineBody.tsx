import React from 'react';
import type { TableRowBase, TableSkeletonRow, TimeLineItem } from '../types/tableTypes';
import { isDataRow } from '../utils/virtualizationUtils';

interface TimeLineBodyProps {
  preparedRows: (TableRowBase | TableSkeletonRow)[];
  minTime?: number;
  maxTime?: number;
  initialVisibleTime?: number;
  timeLineItems?: TimeLineItem[];
  renderTimeLineItem?: (item: TimeLineItem) => React.ReactNode;
}

export const TimeLineBody = ({
  preparedRows,
  minTime,
  maxTime,
  initialVisibleTime,
  timeLineItems = [],
  renderTimeLineItem,
}: TimeLineBodyProps) => {
  const intMinTime = minTime || timeLineItems.reduce((acc, item) => Math.min(acc, item.startTime), Infinity);
  const intMaxTime = maxTime || timeLineItems.reduce((acc, item) => Math.max(acc, item.endTime), -Infinity);

  const [zoom, setZoom] = React.useState(1);

  const preparedTimeLineItems = React.useMemo(
    () =>
      preparedRows.map((row) => {
        if (!isDataRow(row)) return null;

        const items = timeLineItems.filter((item) => item.rowId === row.id);
        return items.length > 0 ? items : null;
      }),
    [preparedRows, timeLineItems],
  );

  const intInitialVisibleTime = initialVisibleTime || intMinTime;
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = (intInitialVisibleTime - intMinTime) * zoom;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const currentScrollLeft = container.scrollLeft;

      setZoom((zoom) => {
        const timeAtCursor = intMinTime + (currentScrollLeft + cursorX) / zoom;

        const zoomDelta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        let newZoom = zoom * zoomDelta;
        newZoom = Math.max(0.1, Math.min(20, newZoom));

        const newScrollLeft = (timeAtCursor - intMinTime) * newZoom - cursorX;
        container.scrollLeft = Math.max(0, newScrollLeft);

        return newZoom;
      });
    };

    el.addEventListener('wheel', handler);
    return () => el.removeEventListener('wheel', handler);
  }, [intMinTime]);

  return (
    <div
      ref={scrollContainerRef}
      style={{ overflowX: 'auto', scrollbarWidth: 'none', width: '100%', height: '100%' }}
    >
      <div style={{ position: 'relative', width: `${(intMaxTime - intMinTime) * zoom}px`, height: '1px' }}>
        {preparedTimeLineItems.map((items, index) => {
          if (!items) return null;
          return items.map((item) => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${(item.startTime - intMinTime) * zoom}px`,
                width: `${(item.endTime - item.startTime) * zoom}px`,
                top: `calc(${index} * var(--table-line-height))`,
                height: `var(--table-line-height)`,
              }}
            >
              {renderTimeLineItem ? renderTimeLineItem(item) : item.id}
            </div>
          ));
        })}
      </div>
    </div>
  );
};
