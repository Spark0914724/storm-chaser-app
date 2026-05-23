import {DatabaseService} from './DatabaseService';
import {STORAGE_KEYS} from './schema';
import {StormEvent, NewStormEvent, StormType} from '../../models/StormEvent';
import {generateId} from '../../utils/generateId';

/**
 * StormEventRepository — CRUD operations for storm events using AsyncStorage.
 *
 * Storage layout:
 *   "storm_events"          → string[]  (ordered list of IDs, newest first)
 *   "storm_event_<id>"      → StormEvent (individual event object)
 */
export const StormEventRepository = {
  /** Insert a new storm event. Returns the saved StormEvent with generated id. */
  async create(event: NewStormEvent): Promise<StormEvent> {
    const id = generateId();
    const createdAt = new Date().toISOString();
    const saved: StormEvent = {...event, id, createdAt};

    // Save the individual event
    await DatabaseService.set<StormEvent>(
      `${STORAGE_KEYS.STORM_EVENT_PREFIX}${id}`,
      saved,
    );

    // Prepend id to the index list
    const ids = (await DatabaseService.get<string[]>(STORAGE_KEYS.STORM_EVENTS)) ?? [];
    await DatabaseService.set<string[]>(STORAGE_KEYS.STORM_EVENTS, [id, ...ids]);

    return saved;
  },

  /** Fetch all storm events, newest first. */
  async findAll(): Promise<StormEvent[]> {
    const ids = (await DatabaseService.get<string[]>(STORAGE_KEYS.STORM_EVENTS)) ?? [];
    const events = await Promise.all(
      ids.map(id =>
        DatabaseService.get<StormEvent>(`${STORAGE_KEYS.STORM_EVENT_PREFIX}${id}`),
      ),
    );
    // Filter out any nulls (orphaned ids)
    return events.filter((e): e is StormEvent => e !== null);
  },

  /** Fetch a single storm event by id. Returns null if not found. */
  async findById(id: string): Promise<StormEvent | null> {
    return DatabaseService.get<StormEvent>(
      `${STORAGE_KEYS.STORM_EVENT_PREFIX}${id}`,
    );
  },

  /** Fetch storm events filtered by storm type. */
  async findByType(stormType: StormType): Promise<StormEvent[]> {
    const all = await StormEventRepository.findAll();
    return all.filter(e => e.stormType === stormType);
  },

  /** Update title, notes, or stormType for an existing storm event. */
  async update(
    id: string,
    updates: Partial<Pick<StormEvent, 'title' | 'notes' | 'stormType'>>,
  ): Promise<void> {
    const existing = await StormEventRepository.findById(id);
    if (!existing) {
      return;
    }
    const updated: StormEvent = {...existing, ...updates};
    await DatabaseService.set<StormEvent>(
      `${STORAGE_KEYS.STORM_EVENT_PREFIX}${id}`,
      updated,
    );
  },

  /** Delete a storm event by id. */
  async delete(id: string): Promise<void> {
    // Remove the individual record
    await DatabaseService.remove(`${STORAGE_KEYS.STORM_EVENT_PREFIX}${id}`);

    // Remove id from the index list
    const ids = (await DatabaseService.get<string[]>(STORAGE_KEYS.STORM_EVENTS)) ?? [];
    await DatabaseService.set<string[]>(
      STORAGE_KEYS.STORM_EVENTS,
      ids.filter(i => i !== id),
    );
  },

  /** Return the total count of saved storm events. */
  async count(): Promise<number> {
    const ids = (await DatabaseService.get<string[]>(STORAGE_KEYS.STORM_EVENTS)) ?? [];
    return ids.length;
  },
};
