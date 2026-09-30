/**
 * Efficient Queue implementation using a ring buffer.
 * Avoids O(n) array.shift() calls that degrade BFS performance on large grids.
 */

import { Position } from '../types';

export class Queue<T = Position> {
  private items: T[];
  private head: number;
  private tail: number;

  constructor(capacity = 2048) {
    this.items = new Array<T>(capacity);
    this.head = 0;
    this.tail = 0;
  }

  enqueue(item: T): void {
    // Grow if needed
    if (this.size() === this.items.length - 1) {
      this._resize();
    }
    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.items.length;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    this.head = (this.head + 1) % this.items.length;
    return item;
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }

  size(): number {
    return (this.tail - this.head + this.items.length) % this.items.length;
  }

  private _resize(): void {
    const newCapacity = this.items.length * 2;
    const newItems = new Array<T>(newCapacity);
    const currentSize = this.size();
    for (let i = 0; i < currentSize; i++) {
      newItems[i] = this.items[(this.head + i) % this.items.length];
    }
    this.items = newItems;
    this.head = 0;
    this.tail = currentSize;
  }
}
