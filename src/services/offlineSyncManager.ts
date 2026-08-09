// src/services/offlineSyncManager.ts

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
}

class OfflineSyncManager {
  private queueKey = 'offline_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Save request to local storage queue if offline
  public enqueue(endpoint: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', payload: any) {
    const queue = this.getQueue();
    const newItem: SyncQueueItem = {
      id: Math.random().toString(36).substring(2, 9),
      endpoint,
      method,
      payload,
      timestamp: Date.now(),
    };

    queue.push(newItem);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));

    if (this.isOnline) {
      this.processQueue();
    }
  }

  public getQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(this.queueKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Attempt to flush queued requests when back online
  public async processQueue() {
    if (!this.isOnline) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    const remainingQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (!response.ok) {
          remainingQueue.push(item);
        }
      } catch (error) {
        console.warn('Sync failed for item, will retry later:', item);
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(this.queueKey, JSON.stringify(remainingQueue));
  }
}

export const offlineSync = new OfflineSyncManager();