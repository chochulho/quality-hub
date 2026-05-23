// Control chart constants (A2, D3, D4, d2, A3, B3, B4) for subgroup sizes n=2..10
export const VARIABLE_CONSTANTS: Record<
  number,
  { A2: number; D3: number; D4: number; d2: number; A3: number; B3: number; B4: number }
> = {
  2:  { A2: 1.880, D3: 0,     D4: 3.267, d2: 1.128, A3: 2.659, B3: 0,     B4: 3.267 },
  3:  { A2: 1.023, D3: 0,     D4: 2.574, d2: 1.693, A3: 1.954, B3: 0,     B4: 2.568 },
  4:  { A2: 0.729, D3: 0,     D4: 2.282, d2: 2.059, A3: 1.628, B3: 0,     B4: 2.266 },
  5:  { A2: 0.577, D3: 0,     D4: 2.114, d2: 2.326, A3: 1.427, B3: 0,     B4: 2.089 },
  6:  { A2: 0.483, D3: 0,     D4: 2.004, d2: 2.534, A3: 1.287, B3: 0.030, B4: 1.970 },
  7:  { A2: 0.419, D3: 0.076, D4: 1.924, d2: 2.704, A3: 1.182, B3: 0.118, B4: 1.882 },
  8:  { A2: 0.373, D3: 0.136, D4: 1.864, d2: 2.847, A3: 1.099, B3: 0.185, B4: 1.815 },
  9:  { A2: 0.337, D3: 0.184, D4: 1.816, d2: 2.970, A3: 1.032, B3: 0.239, B4: 1.761 },
  10: { A2: 0.308, D3: 0.223, D4: 1.777, d2: 3.078, A3: 0.975, B3: 0.284, B4: 1.716 },
};

// I-MR uses n=2 constants for MR chart
export const IMR_D4 = 3.267;
export const IMR_D3 = 0;
export const IMR_D2 = 1.128;
