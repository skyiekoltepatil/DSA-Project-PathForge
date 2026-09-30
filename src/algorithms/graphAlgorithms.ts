import { AdjacencyList, GraphAlgorithmResult, GraphNode } from '../types/graph';
import { Queue, MinHeap } from '../dataStructures';
import { getDistance } from '../utils/osm';

function reconstructPath(
  cameFrom: Map<string, string>,
  currentId: string
): string[] {
  const path = [currentId];
  let curr = currentId;
  while (cameFrom.has(curr)) {
    curr = cameFrom.get(curr)!;
    path.unshift(curr);
  }
  return path;
}

// Sum edge weights along a path; returns total length in meters (or null if not found)
function computeTotalDistance(
  adjList: AdjacencyList,
  path: string[]
): number | null {
  if (path.length < 2) return null;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = adjList
      .get(path[i])
      ?.find(e => e.to === path[i + 1]);
    if (!edge) return null;
    total += edge.weight;
  }
  return total;
}

// Shared helper so every algorithm returns totalDistance the same way
function buildResult(
  adjList: AdjacencyList,
  visitedOrder: string[],
  path: string[],
  found: boolean,
  timeTaken: number
): GraphAlgorithmResult {
  return {
    visitedOrder,
    path,
    found,
    timeTaken,
    totalDistance: found ? computeTotalDistance(adjList, path) : undefined,
  };
}

export function bfsGraph(
  adjList: AdjacencyList,
  startId: string,
  endId: string
): GraphAlgorithmResult {
  const start = performance.now();
  const queue = new Queue<string>();
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const visitedOrder: string[] = [];

  queue.enqueue(startId);
  visited.add(startId);

  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    visitedOrder.push(current);

    if (current === endId) {
      return buildResult(
        adjList,
        visitedOrder,
        reconstructPath(cameFrom, current),
        true,
        performance.now() - start
      );
    }

    const neighbors = adjList.get(current) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        cameFrom.set(edge.to, current);
        queue.enqueue(edge.to);
      }
    }
  }

  return buildResult(adjList, visitedOrder, [], false, performance.now() - start);
}

export function dijkstraGraph(
  adjList: AdjacencyList,
  startId: string,
  endId: string
): GraphAlgorithmResult {
  const start = performance.now();
  const pq = new MinHeap<string>();
  const distances = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  for (const id of adjList.keys()) {
    distances.set(id, Infinity);
  }
  
  distances.set(startId, 0);
  pq.insert(startId, 0);

  while (!pq.isEmpty()) {
    const current = pq.extractMin()!.item;
    
    if (visited.has(current)) continue;
    visited.add(current);
    visitedOrder.push(current);

    if (current === endId) {
      return buildResult(
        adjList,
        visitedOrder,
        reconstructPath(cameFrom, current),
        true,
        performance.now() - start
      );
    }

    const currentDist = distances.get(current)!;
    const neighbors = adjList.get(current) || [];

    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const newDist = currentDist + edge.weight;
      if (newDist < (distances.get(edge.to) || Infinity)) {
        distances.set(edge.to, newDist);
        cameFrom.set(edge.to, current);
        pq.insert(edge.to, newDist);
      }
    }
  }

  return buildResult(adjList, visitedOrder, [], false, performance.now() - start);
}

export function astarGraph(
  adjList: AdjacencyList,
  nodes: Map<string, GraphNode>,
  startId: string,
  endId: string
): GraphAlgorithmResult {
  const start = performance.now();
  const pq = new MinHeap<string>();
  
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  for (const id of adjList.keys()) {
    gScore.set(id, Infinity);
    fScore.set(id, Infinity);
  }

  const endNode = nodes.get(endId);
  if (!endNode) throw new Error("End node not found");

  gScore.set(startId, 0);
  
  const startNode = nodes.get(startId)!;
  const initialH = getDistance(startNode.lat, startNode.lon, endNode.lat, endNode.lon);
  
  fScore.set(startId, initialH);
  pq.insert(startId, initialH);

  while (!pq.isEmpty()) {
    const current = pq.extractMin()!.item;
    
    if (visited.has(current)) continue;
    visited.add(current);
    visitedOrder.push(current);

    if (current === endId) {
      return buildResult(
        adjList,
        visitedOrder,
        reconstructPath(cameFrom, current),
        true,
        performance.now() - start
      );
    }

    const currentG = gScore.get(current)!;
    const neighbors = adjList.get(current) || [];

    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const tentativeG = currentG + edge.weight;
      if (tentativeG < (gScore.get(edge.to) || Infinity)) {
        cameFrom.set(edge.to, current);
        gScore.set(edge.to, tentativeG);
        
        const neighborNode = nodes.get(edge.to)!;
        const h = getDistance(neighborNode.lat, neighborNode.lon, endNode.lat, endNode.lon);
        
        const f = tentativeG + h;
        fScore.set(edge.to, f);
        pq.insert(edge.to, f);
      }
    }
  }

  return buildResult(adjList, visitedOrder, [], false, performance.now() - start);
}
