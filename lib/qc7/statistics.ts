export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

export function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denom = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    denom += (xs[i] - xMean) ** 2;
  }
  const slope = denom === 0 ? 0 : num / denom;
  return { slope, intercept: yMean - slope * xMean };
}

export function computeCorrelationMatrix(cols: number[][]): number[][] {
  const k = cols.length;
  return cols.map((col, i) =>
    cols.map((col2, j) => (i === j ? 1 : pearsonCorrelation(col, col2)))
  );
}

export interface CPMTask {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
}

export interface CPMResult extends CPMTask {
  es: number;
  ef: number;
  ls: number;
  lf: number;
  float: number;
  isCritical: boolean;
}

export function computeCPM(tasks: CPMTask[]): CPMResult[] {
  const map = new Map<string, CPMResult>(
    tasks.map((t) => [t.id, { ...t, es: 0, ef: 0, ls: 0, lf: 0, float: 0, isCritical: false }])
  );

  // Topological order using Kahn's algorithm
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const t of tasks) {
    indegree.set(t.id, t.predecessors.length);
    adj.set(t.id, []);
  }
  for (const t of tasks) {
    for (const p of t.predecessors) {
      adj.get(p)?.push(t.id);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id);
  }
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const succ of adj.get(id) ?? []) {
      const deg = (indegree.get(succ) ?? 1) - 1;
      indegree.set(succ, deg);
      if (deg === 0) queue.push(succ);
    }
  }

  // Forward pass
  for (const id of order) {
    const node = map.get(id)!;
    const predEFs = node.predecessors.map((p) => map.get(p)?.ef ?? 0);
    node.es = predEFs.length ? Math.max(...predEFs) : 0;
    node.ef = node.es + node.duration;
  }

  // Backward pass
  const maxEF = Math.max(...[...map.values()].map((n) => n.ef));
  for (const id of [...order].reverse()) {
    const node = map.get(id)!;
    const succLSs = (adj.get(id) ?? []).map((s) => map.get(s)?.ls ?? maxEF);
    node.lf = succLSs.length ? Math.min(...succLSs) : maxEF;
    node.ls = node.lf - node.duration;
    node.float = node.ls - node.es;
    node.isCritical = node.float === 0;
  }

  return order.map((id) => map.get(id)!);
}
