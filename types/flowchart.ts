// Flowchart definition types for QMS process document visualization

export type FlowNodeType = 'start' | 'end' | 'process' | 'decision' | 'note'
export type FlowColor = 'orange' | 'teal' | 'navy' | 'blue' | 'green' | 'amber' | 'white' | 'gray'
export type FlowRoute = 'default' | 'left-loop'

export interface FlowNode {
  id: string
  type: FlowNodeType
  label: string      // use \n for line breaks
  sublabel?: string
  row: number        // vertical grid position (0 = top)
  col: number        // 0 = main column, 1 = right annotation
  color?: FlowColor
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
  style?: 'solid' | 'dashed'
  route?: FlowRoute
}

export interface FlowLane {
  id: string
  label: string       // short label shown on left
  rowStart: number
  rowEnd: number
  bgColor: string     // CSS rgba color
}

export interface FlowDef {
  lanes?: FlowLane[]
  nodes: FlowNode[]
  edges: FlowEdge[]
}
