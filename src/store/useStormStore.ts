import {useState, useCallback} from 'react';
import {StormEvent} from '../models';
import {StormEventRepository} from '../services/database';

export type StormStoreStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StormStore {
  events: StormEvent[];
  status: StormStoreStatus;
  error: string | null;
  load: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * useStormStore — manages the list of saved storm events.
 * Provides load and delete operations with loading/error states.
 */
export const useStormStore = (): StormStore => {
  const [events, setEvents] = useState<StormEvent[]>([]);
  const [status, setStatus] = useState<StormStoreStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const all = await StormEventRepository.findAll();
      setEvents(all);
      setStatus('success');
    } catch (err) {
      console.error('[useStormStore] Load failed:', err);
      setError('Failed to load storm events.');
      setStatus('error');
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await StormEventRepository.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('[useStormStore] Delete failed:', err);
    }
  }, []);

  return {events, status, error, load, remove};
};
