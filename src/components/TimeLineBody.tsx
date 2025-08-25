import React from "react";
import type { TableRowBase, TableSkeletonRow, TimeLineItem } from "../types/tableTypes";
import { isDataRow } from "../utils/virtualizationUtils";

interface TimeLineBodyProps {
    preparedRows: (TableRowBase | TableSkeletonRow)[],
    minTime?: number,
    maxTime?: number,
    initialVisibleTime?: number,
    timeLineItems?: TimeLineItem[],
    renderTimeLineItem?: (item: TimeLineItem) => React.ReactNode,
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

    const preparedTimeLineItems = React.useMemo(() => preparedRows.map(row => {
        if (!isDataRow(row)) return null;

        const items = timeLineItems.filter(item => item.rowId === row.id);
        return items.length > 0 ? items : null;
    }), [preparedRows]);

    const intInitialVisibleTime = initialVisibleTime || intMinTime;
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = intInitialVisibleTime - intMinTime;
        }
    }, [intInitialVisibleTime]);

    return (
        <div ref={scrollContainerRef} style={{ overflowX: 'auto', scrollbarWidth: 'none', width: '100%', height: '100%' }}>
            <div style={{ position: 'relative', width: `${intMaxTime - intMinTime}px`, height: '1px' }}>
            {preparedTimeLineItems.map((items, index) => {
                if (!items) return null;
                return items.map((item) => (
                    <div 
                        key={item.id}
                        style={{
                            position: 'absolute',
                            left: `${item.startTime - intMinTime}px`,
                            width: `${item.endTime - item.startTime}px`,
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
