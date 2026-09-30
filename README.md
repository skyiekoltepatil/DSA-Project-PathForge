# PathForge — Interactive Shortest Path Visualizer

PathForge is a professional, interactive web application built to visualize and compare Data Structures and Algorithms (DSA), specifically shortest-path graph algorithms.

## Features

- **Interactive Grid System**: Click and drag to create walls, move start/end nodes, and paint weighted terrain.
- **Algorithm Visualization**: Watch algorithms explore the grid in real-time with adjustable animation speeds.
- **Side-by-Side Comparison**: Run all algorithms instantly on the current grid to compare path length, nodes explored, and execution time.
- **Maze Generation**: Generate complex mazes using the Recursive Backtracking algorithm.
- **Responsive Design**: Adapts the grid size based on your viewport.
- **Educational Details**: See time/space complexities, data structure information, and pseudocode for every algorithm.

## Algorithms Implemented

- **Breadth-First Search (BFS)**: Explores level by level using a Queue. Guarantees the shortest path in unweighted graphs.
- **Depth-First Search (DFS)**: Explores as deeply as possible before backtracking using a Stack. Does not guarantee optimal paths.
- **Dijkstra's Algorithm**: Always expands the node with the lowest cost using a Min-Heap Priority Queue. Guarantees the shortest path for weighted graphs.
- **A* Search**: Uses a heuristic (Manhattan Distance) alongside cost to aggressively target the destination. Uses a Min-Heap. Extremely efficient and guarantees shortest path.

## Core Data Structures

- **Queue**: Implemented using a custom Ring Buffer to avoid the O(n) performance penalty of `Array.prototype.shift()`.
- **Min-Heap (Priority Queue)**: Provides O(log N) insert and extract-min operations, critical for the performance of Dijkstra and A*.
- **Hash Sets & Maps**: Used heavily for `visited` tracking and parent reconstruction in O(1) time.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Animations)
- **Icons**: Lucide React

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

- `/src/algorithms`: The core logic for BFS, DFS, Dijkstra, and A*, fully decoupled from the UI.
- `/src/dataStructures`: Custom `Queue` and `MinHeap` implementations.
- `/src/components`: Modular React UI components (`Grid`, `Node`, `Controls`, `StatsPanel`, etc.)
- `/src/hooks`: Custom hooks like `usePathfinding` to manage the complex simulation state and animation timers.
- `/src/utils`: Grid geometry math, heuristics, and constants.
- `/src/maze`: Recursive Backtracking maze generation.

## Learning Outcomes

This project demonstrates practical implementations of fundamental Graph Theory and Data Structures. It highlights the real-world differences between unweighted (BFS) and weighted (Dijkstra) searches, and shows how adding a heuristic (A*) dramatically reduces the search space compared to uninformed algorithms.
