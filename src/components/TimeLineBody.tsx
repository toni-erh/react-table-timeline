import React from "react";
import type { TableRowBase, TableSkeletonRow, TimeLineItem } from "../types/tableTypes";
import { isDataRow } from "../utils/virtualizationUtils";

interface TimeLineBodyProps {
    preparedRows: (TableRowBase | TableSkeletonRow)[],
    timeLineItems?: TimeLineItem[],
    renderTimeLineItem?: (item: TimeLineItem) => React.ReactNode,
}

export const TimeLineBody = ({
    preparedRows,
    timeLineItems = [],
    renderTimeLineItem,
}: TimeLineBodyProps) => {
    const preparedTimeLineItems = React.useMemo(() => preparedRows.map(row => {
        if (!isDataRow(row)) return null;

        const items = timeLineItems.filter(item => item.rowId === row.id);
        return items.length > 0 ? items : null;
    }), [preparedRows]);
    return (
        <div style={{ position: 'relative' }}>
            {preparedTimeLineItems.map((items, index) => {
                if (!items) return null;
                return items.map((item) => (
                    <div 
                        key={item.id}
                        style={{
                            position: 'absolute',
                            left: `${item.startTime}px`,
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
    );
};
