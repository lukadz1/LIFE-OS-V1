interface LayoutInput {
  id: string;
  startMin: number;
  endMin: number;
}

export interface LayoutSlot {
  lane: number;
  laneCount: number;
}

/** Interval-graph-coloring layout for same-day events that overlap in time:
 * each connected cluster of overlapping events gets its own lane count, so
 * two 9am meetings sit side by side while unrelated events elsewhere in the
 * day stay full width. */
export function layoutOverlaps(items: LayoutInput[]): Map<string, LayoutSlot> {
  const sorted = [...items].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const result = new Map<string, LayoutSlot>();
  const laneEndTimes: number[] = [];
  const laneById = new Map<string, number>();
  let clusterIds: string[] = [];
  let clusterMaxEnd = -Infinity;

  const closeCluster = () => {
    const laneCount = laneEndTimes.length;
    for (const id of clusterIds) {
      result.set(id, { lane: laneById.get(id)!, laneCount });
    }
    clusterIds = [];
    laneEndTimes.length = 0;
    clusterMaxEnd = -Infinity;
  };

  for (const item of sorted) {
    if (clusterIds.length > 0 && item.startMin >= clusterMaxEnd) {
      closeCluster();
    }
    let lane = laneEndTimes.findIndex((end) => end <= item.startMin);
    if (lane === -1) {
      lane = laneEndTimes.length;
      laneEndTimes.push(item.endMin);
    } else {
      laneEndTimes[lane] = item.endMin;
    }
    laneById.set(item.id, lane);
    clusterIds.push(item.id);
    clusterMaxEnd = Math.max(clusterMaxEnd, item.endMin);
  }
  closeCluster();

  return result;
}
