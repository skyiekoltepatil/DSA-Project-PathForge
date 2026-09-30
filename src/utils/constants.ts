/**
 * Application constants for PathForge
 */

import { AlgorithmInfo, AlgorithmType, AnimationSpeed } from '../types';

// Grid defaults — responsive, will be recalculated based on viewport
export const DEFAULT_ROWS = 25;
export const DEFAULT_COLS = 55;
export const CELL_SIZE = 24; // px
export const MIN_CELL_SIZE = 16;
export const MAX_CELL_SIZE = 32;

// Weight for weighted terrain
export const DEFAULT_WEIGHT = 1;
export const WEIGHTED_CELL_COST = 5;

// Animation delays (milliseconds per step)
export const ANIMATION_DELAYS: Record<AnimationSpeed, number> = {
  [AnimationSpeed.SLOW]: 40,
  [AnimationSpeed.NORMAL]: 15,
  [AnimationSpeed.FAST]: 4,
};

// Path animation is slower to emphasize the result
export const PATH_ANIMATION_DELAYS: Record<AnimationSpeed, number> = {
  [AnimationSpeed.SLOW]: 60,
  [AnimationSpeed.NORMAL]: 30,
  [AnimationSpeed.FAST]: 10,
};

// Algorithm metadata
export const ALGORITHM_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  [AlgorithmType.BFS]: {
    name: 'Breadth-First Search',
    type: AlgorithmType.BFS,
    description:
      'Explores nodes level by level using a queue. Guarantees the shortest path in an unweighted graph by visiting all neighbors at the current depth before moving deeper.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Queue',
    guaranteesShortestPath: true,
    pseudocode: `BFS(graph, start, end):
    queue ← new Queue()
    queue.enqueue(start)
    visited ← {start}
    parent ← {}

    while queue is not empty:
        node ← queue.dequeue()
        if node = end:
            return reconstructPath(parent, end)
        for each neighbor of node:
            if neighbor ∉ visited:
                visited.add(neighbor)
                parent[neighbor] ← node
                queue.enqueue(neighbor)

    return "No path found"`,
  },

  [AlgorithmType.DFS]: {
    name: 'Depth-First Search',
    type: AlgorithmType.DFS,
    description:
      'Explores as deeply as possible along each branch before backtracking. Uses a stack (or recursion). Does NOT guarantee the shortest path — it finds a path, but it may be much longer than optimal.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Stack',
    guaranteesShortestPath: false,
    pseudocode: `DFS(graph, start, end):
    stack ← new Stack()
    stack.push(start)
    visited ← {}
    parent ← {}

    while stack is not empty:
        node ← stack.pop()
        if node ∈ visited:
            continue
        visited.add(node)
        if node = end:
            return reconstructPath(parent, end)
        for each neighbor of node:
            if neighbor ∉ visited:
                parent[neighbor] ← node
                stack.push(neighbor)

    return "No path found"`,
  },

  [AlgorithmType.DIJKSTRA]: {
    name: "Dijkstra's Algorithm",
    type: AlgorithmType.DIJKSTRA,
    description:
      'Finds the shortest path by always expanding the node with the smallest known distance. Uses a priority queue (min-heap). Handles weighted edges correctly.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Priority Queue (Min-Heap)',
    guaranteesShortestPath: true,
    pseudocode: `Dijkstra(graph, start, end):
    dist ← {start: 0}
    pq ← new MinHeap()
    pq.insert(start, 0)
    parent ← {}
    visited ← {}

    while pq is not empty:
        node ← pq.extractMin()
        if node ∈ visited:
            continue
        visited.add(node)
        if node = end:
            return reconstructPath(parent, end)
        for each neighbor of node:
            newDist ← dist[node] + weight(node, neighbor)
            if newDist < dist[neighbor]:
                dist[neighbor] ← newDist
                parent[neighbor] ← node
                pq.insert(neighbor, newDist)

    return "No path found"`,
  },

  [AlgorithmType.ASTAR]: {
    name: 'A* Search',
    type: AlgorithmType.ASTAR,
    description:
      'Combines actual distance (g-score) with a heuristic estimate (h-score) toward the destination. Uses Manhattan distance as the heuristic for grid movement. More efficient than Dijkstra when a good heuristic is available.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Priority Queue (Min-Heap)',
    guaranteesShortestPath: true,
    pseudocode: `A*(graph, start, end):
    gScore ← {start: 0}
    fScore ← {start: heuristic(start, end)}
    pq ← new MinHeap()
    pq.insert(start, fScore[start])
    parent ← {}
    visited ← {}

    while pq is not empty:
        node ← pq.extractMin()
        if node ∈ visited:
            continue
        visited.add(node)
        if node = end:
            return reconstructPath(parent, end)
        for each neighbor of node:
            tentative_g ← gScore[node] + weight(node, neighbor)
            if tentative_g < gScore[neighbor]:
                gScore[neighbor] ← tentative_g
                fScore[neighbor] ← tentative_g + heuristic(neighbor, end)
                parent[neighbor] ← node
                pq.insert(neighbor, fScore[neighbor])

    return "No path found"`,
  },
};

// Grid directions: up, right, down, left
export const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  START_PAUSE: ' ',        // Space
  RESET: 'r',
  CLEAR: 'c',
  MAZE: 'm',
} as const;
