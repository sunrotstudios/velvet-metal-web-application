import { ServiceType } from '../types';
import logger from '@/lib/logger';

interface SyncQueueItem {
  userId: string;
  service: ServiceType;
  priority: number;
  retryCount: number;
  lastAttempt?: Date;
}

class LibrarySyncQueue {
  private queue: SyncQueueItem[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private readonly backoffMultiplier = 1.5;
  private readonly baseDelay = 1000; // 1 second

  public enqueue(userId: string, service: ServiceType, priority = 0) {
    logger.info('Enqueueing sync task:', { userId, service, priority });
    
    const existingItem = this.queue.find(
      (item) => item.userId === userId && item.service === service
    );

    if (existingItem) {
      logger.info('Found existing sync task, updating priority');
      existingItem.priority = Math.max(existingItem.priority, priority);
      return;
    }

    this.queue.push({
      userId,
      service,
      priority,
      retryCount: 0,
    });

    logger.info('Current queue:', this.queue);
    this.sortQueue();
    
    if (!this.isProcessing) {
      logger.info('Starting queue processing');
      this.processQueue();
    }
  }

  private sortQueue() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      logger.info('Queue processing skipped:', { 
        queueEmpty: this.queue.length === 0,
        isProcessing: this.isProcessing
      });
      return;
    }

    this.isProcessing = true;
    const item = this.queue[0];
    logger.info('Processing sync task:', item);

    try {
      await this.processSyncItem(item);
      logger.info('Sync task completed successfully');
      this.queue.shift(); // Remove the processed item
    } catch (error) {
      console.error(`Sync failed for ${item.service}:`, error);
      
      if (item.retryCount < this.maxRetries) {
        item.retryCount++;
        item.lastAttempt = new Date();
        logger.info(`Retrying sync task (attempt ${item.retryCount}/${this.maxRetries})`);
        // Move to the end of the queue
        this.queue.shift();
        this.queue.push(item);
      } else {
        console.error(`Max retries reached for ${item.service} sync`);
        this.queue.shift();
      }
    }

    this.isProcessing = false;
    
    // Continue processing if there are more items
    if (this.queue.length > 0) {
      const nextItem = this.queue[0];
      const delay = this.calculateBackoff(nextItem);
      logger.info(`Scheduling next sync task in ${delay}ms`);
      setTimeout(() => this.processQueue(), delay);
    }
  }

  private calculateBackoff(item: SyncQueueItem): number {
    if (!item.lastAttempt || item.retryCount === 0) return 0;
    
    const backoffDelay = this.baseDelay * Math.pow(this.backoffMultiplier, item.retryCount - 1);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return backoffDelay + jitter;
  }

  private async processSyncItem(item: SyncQueueItem) {
    const { syncUserLibraries } = await import('./streaming-library-sync');
    await syncUserLibraries(item.userId, item.service);

    // Log sync completion
    const { data, error } = await supabase
      .from('library_sync_history')
      .insert({
        user_id: item.userId,
        service: item.service,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging sync completion:', error);
    }
  }
}

export const librarySyncQueue = new LibrarySyncQueue();
