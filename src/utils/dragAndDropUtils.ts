import type { RowExpansions, RowReorderEvent, RowReorderPlacement } from "../types/tableTypes";
import { computePath } from "./treeUtils";

/**
 * Computes the placement of a dragged row based on the drag event
 * @param e the drag event
 * @returns the placement of the dragged row
 */
export function computePlacement(e: React.DragEvent<HTMLDivElement>): RowReorderPlacement {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const threshold = rect.height * 0.25;
    if (offsetY < threshold) return 'before';
    if (offsetY > rect.height - threshold) return 'after';
    return 'inside';
};

/**
 * Prepares a row reorder event
 * @param sourceId the id of the source row
 * @param targetId the id of the target row
 * @param placement the placement of the dragged row
 * @param rowExpansions the row expansions
 * @returns the row reorder event
 */
export function prepareRowReorderEvent(
    sourceId: string,
    targetId: string,
    placement: RowReorderPlacement,
    rowExpansions: RowExpansions
): RowReorderEvent {
    const source = rowExpansions.get(sourceId);
    const target = rowExpansions.get(targetId);
    const sourceParentId = source?.parentId;
    const targetParentId = target?.parentId;

    const prevSiblingId = (() => {
      switch (placement) {
        case 'before':
          return target?.prevSiblingId;
        case 'after':
          return targetId;
        case 'inside':
          return undefined;
      }
    })();

    const nextSiblingId = (() => {
      switch (placement) {
        case 'before':
          return targetId;
        case 'after':
          return target?.nextSiblingId;
        case 'inside':
          return target?.childrenIds[0];
      }
    })();

    const event: RowReorderEvent = {
      sourceId,
      sourceParentId,
      sourcePath: computePath(rowExpansions, sourceId),
      targetId,
      targetParentId,
      targetPath: computePath(rowExpansions, targetId),
      placement,
      newParentId: placement === 'inside' ? targetId : targetParentId,
      prevSiblingId,
      nextSiblingId,
      isSameParentMove: (sourceParentId ?? null) === (placement === 'inside' ? targetId : targetParentId ?? null),
    };

    return event;
}
