import type { VSMState, VSMMetrics, ProcessMetrics } from "./types";

export function calcVSMMetrics(state: VSMState): VSMMetrics {
  const { header, processes, inventories } = state;
  const { dailyDemand, workingSeconds } = header;

  const taktTime = dailyDemand > 0 ? workingSeconds / dailyDemand : 0;

  const processMetrics: ProcessMetrics[] = processes.map((p) => {
    const effectiveCT = p.uptime > 0 ? p.cycleTime / (p.uptime / 100) : p.cycleTime;
    const bottleneckRatio = taktTime > 0 ? effectiveCT / taktTime : 0;
    return {
      effectiveCT,
      taktTime,
      bottleneckRatio,
      isBottleneck: false,
    };
  });

  // Mark worst process as bottleneck
  let maxRatio = 0;
  let bottleneckIdx = 0;
  processMetrics.forEach((m, i) => {
    if (m.bottleneckRatio > maxRatio) {
      maxRatio = m.bottleneckRatio;
      bottleneckIdx = i;
    }
  });
  if (processes.length > 0) processMetrics[bottleneckIdx].isBottleneck = true;

  const inventoryDays = inventories.map((inv) =>
    dailyDemand > 0 ? inv.quantity / dailyDemand : 0
  );

  const totalInventoryDays = inventoryDays.reduce((sum, d) => sum + d, 0);
  const vatSeconds = processes.reduce((sum, p) => sum + p.cycleTime, 0);
  const vatDays = workingSeconds > 0 ? vatSeconds / workingSeconds : 0;
  const totalLTDays = totalInventoryDays + vatDays;

  const ltSeconds = totalLTDays * workingSeconds;
  const nvaRatio = ltSeconds > 0 ? ((ltSeconds - vatSeconds) / ltSeconds) * 100 : 0;

  const bottleneckProcess =
    processes.length > 0 ? processes[bottleneckIdx].name : "-";

  return {
    taktTime,
    totalLTDays,
    vatSeconds,
    nvaRatio,
    bottleneckProcess,
    bottleneckRatio: maxRatio,
    processMetrics,
    inventoryDays,
  };
}

export function makeSampleState(): VSMState {
  return {
    mode: "current",
    header: {
      supplierName: "철강사",
      customerName: "완성차",
      dailyDemand: 480,
      workingSeconds: 27000,
    },
    processes: [
      { id: "p1", name: "프레스", cycleTime: 45, changeoverTime: 45, uptime: 85, operators: 1, shifts: 1 },
      { id: "p2", name: "용접 #1", cycleTime: 55, changeoverTime: 10, uptime: 90, operators: 2, shifts: 1 },
      { id: "p3", name: "조립", cycleTime: 50, changeoverTime: 5, uptime: 95, operators: 2, shifts: 1 },
    ],
    inventories: [
      { id: "i0", quantity: 2400 },
      { id: "i1", quantity: 960 },
      { id: "i2", quantity: 480 },
      { id: "i3", quantity: 1440 },
    ],
    droppedIcons: [],
  };
}
