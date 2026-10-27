export interface SyncQueueItem {
  id: string;
  recordId: string;
  recordRid?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entity: string;
  title: string;
  department: string;
  timestamp: string;
  status: 'Pending' | 'Syncing' | 'Synced' | 'Failed';
  errorMessage?: string;
}

const STORAGE_KEY = 'pms11_rich_sync_queue_v1';

export const getStoredSyncQueue = (): SyncQueueItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    console.error('Failed to parse sync queue', e);
    return [];
  }
};

export const saveSyncQueue = (queue: SyncQueueItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save sync queue', e);
  }
};

export const addSyncQueueItem = (
  itemData: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status'>
): SyncQueueItem[] => {
  const current = getStoredSyncQueue();
  const newItem: SyncQueueItem = {
    ...itemData,
    id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    status: 'Pending'
  };

  // Prevent duplicate pending action for exact same recordId & action
  const filtered = current.filter(
    i => !(i.recordId === newItem.recordId && i.action === newItem.action)
  );

  const updated = [newItem, ...filtered];
  saveSyncQueue(updated);
  return updated;
};

export const removeSyncQueueItem = (id: string): SyncQueueItem[] => {
  const current = getStoredSyncQueue();
  const updated = current.filter(i => i.id !== id);
  saveSyncQueue(updated);
  return updated;
};

export const clearSyncQueue = (): SyncQueueItem[] => {
  saveSyncQueue([]);
  return [];
};

/**
 * Simulates active server synchronization with progressive status updates.
 */
export const processSyncQueue = async (
  onQueueUpdate?: (queue: SyncQueueItem[]) => void
): Promise<{ success: boolean; syncedCount: number }> => {
  const current = getStoredSyncQueue();
  if (current.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  // Mark all items as 'Syncing'
  const syncingQueue = current.map(item => ({ ...item, status: 'Syncing' as const }));
  saveSyncQueue(syncingQueue);
  if (onQueueUpdate) onQueueUpdate(syncingQueue);

  // Simulate network round-trip delay per item
  await new Promise(resolve => setTimeout(resolve, 800));

  // Clear successfully synced items from storage
  clearSyncQueue();
  if (onQueueUpdate) onQueueUpdate([]);

  return { success: true, syncedCount: current.length };
};
