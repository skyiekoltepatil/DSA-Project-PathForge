/**
 * Min-Heap based Priority Queue for Dijkstra and A*.
 * Stores Position with associated priority (distance/fScore).
 * Provides O(log n) insert and extractMin operations.
 */

import { Position } from '../types';

interface HeapNode<T> {
  item: T;
  priority: number;
}

export class MinHeap<T = Position> {
  private heap: HeapNode<T>[];

  constructor() {
    this.heap = [];
  }

  insert(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin(): HeapNode<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private _bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[parentIdx].priority <= this.heap[index].priority) break;
      [this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]];
      index = parentIdx;
    }
  }

  private _sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;
      let smallest = index;

      if (leftIdx < length && this.heap[leftIdx].priority < this.heap[smallest].priority) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.heap[rightIdx].priority < this.heap[smallest].priority) {
        smallest = rightIdx;
      }
      if (smallest === index) break;
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

export class PriorityQueue<T = Position> {
  private minHeap: MinHeap<T>;

  constructor() {
    this.minHeap = new MinHeap<T>();
  }

  enqueue(item: T, priority: number): void {
    this.minHeap.insert(item, priority);
  }

  dequeue(): { item: T; priority: number } | undefined {
    return this.minHeap.extractMin();
  }

  isEmpty(): boolean {
    return this.minHeap.isEmpty();
  }

  size(): number {
    return this.minHeap.size();
  }
}
