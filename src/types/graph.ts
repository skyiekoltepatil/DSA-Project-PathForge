export interface GraphNode {
  id: string;
  lat: number;
  lon: number;
}

export interface GraphEdge {
  to: string; // Target node ID
  weight: number; // Distance in meters
}

export type AdjacencyList = Map<string, GraphEdge[]>;

export interface GraphAlgorithmResult {
  visitedOrder: string[]; // Array of node IDs
  path: string[]; // Array of node IDs
  found: boolean;
  timeTaken: number;
  totalDistance?: number | null; // Total path length in meters (sum of edge weights); null if it couldn't be computed
}
