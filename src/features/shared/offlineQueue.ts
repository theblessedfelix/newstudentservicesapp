const OFFLINE_QUEUE_KEY = 'student-volunteer-offline-queue';

export type OfflineMutation = {
  id: string;
  entity: 'attendance' | 'approvals';
  operation: 'create' | 'update';
  payload: Record<string, unknown>;
  createdAt: string;
};

function readQueue(): OfflineMutation[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as OfflineMutation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineMutation[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineMutation(mutation: Omit<OfflineMutation, 'id' | 'createdAt'>) {
  const queue = readQueue();
  queue.push({
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });
  writeQueue(queue);
}

export function getOfflineQueue() {
  return readQueue();
}

export function clearOfflineMutation(id: string) {
  writeQueue(readQueue().filter((mutation) => mutation.id !== id));
}