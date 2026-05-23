import {databaseService} from './DatabaseService';
import {StormEvent, NewStormEvent, StormType} from '../../models/StormEvent';
import {generateId} from '../../utils/generateId';

/** Raw row shape returned by SQLite for storm_events */
interface StormEventRow {
  id: string;
  photo_uri: string;
  storm_type: StormType;
  title: string;
  notes: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  location_name: string | null;
  temperature: number;
  feels_like: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  precipitation: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  weather_code: number;
  weather_desc: string;
  captured_at: string;
  created_at: string;
}

/** Map a raw DB row to the StormEvent domain model */
const rowToStormEvent = (row: StormEventRow): StormEvent => ({
  id: row.id,
  photoUri: row.photo_uri,
  stormType: row.storm_type,
  title: row.title,
  notes: row.notes,
  location: {
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude ?? undefined,
  },
  locationName: row.location_name ?? undefined,
  weatherConditions: {
    temperature: row.temperature,
    feelsLike: row.feels_like,
    windSpeed: row.wind_speed,
    windDirection: row.wind_direction,
    windGusts: row.wind_gusts,
    precipitation: row.precipitation,
    humidity: row.humidity,
    pressure: row.pressure,
    visibility: row.visibility,
    uvIndex: row.uv_index,
    weatherCode: row.weather_code,
    description: row.weather_desc,
  },
  capturedAt: row.captured_at,
  createdAt: row.created_at,
});

/**
 * StormEventRepository — all CRUD operations for storm events.
 */
export const StormEventRepository = {
  /** Insert a new storm event. Returns the saved StormEvent with generated id. */
  create(event: NewStormEvent): StormEvent {
    const id = generateId();
    const createdAt = new Date().toISOString();
    const {
      photoUri,
      stormType,
      title,
      notes,
      location,
      locationName,
      weatherConditions,
      capturedAt,
    } = event;

    databaseService.execute(
      `INSERT INTO storm_events (
        id, photo_uri, storm_type, title, notes,
        latitude, longitude, altitude, location_name,
        temperature, feels_like, wind_speed, wind_direction, wind_gusts,
        precipitation, humidity, pressure, visibility, uv_index,
        weather_code, weather_desc, captured_at, created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )`,
      [
        id,
        photoUri,
        stormType,
        title,
        notes,
        location.latitude,
        location.longitude,
        location.altitude ?? null,
        locationName ?? null,
        weatherConditions.temperature,
        weatherConditions.feelsLike,
        weatherConditions.windSpeed,
        weatherConditions.windDirection,
        weatherConditions.windGusts,
        weatherConditions.precipitation,
        weatherConditions.humidity,
        weatherConditions.pressure,
        weatherConditions.visibility,
        weatherConditions.uvIndex,
        weatherConditions.weatherCode,
        weatherConditions.description,
        capturedAt,
        createdAt,
      ],
    );

    return {...event, id, createdAt};
  },

  /** Fetch all storm events, newest first. */
  findAll(): StormEvent[] {
    const rows = databaseService.query<StormEventRow>(
      'SELECT * FROM storm_events ORDER BY created_at DESC',
    );
    return rows.map(rowToStormEvent);
  },

  /** Fetch a single storm event by id. Returns null if not found. */
  findById(id: string): StormEvent | null {
    const rows = databaseService.query<StormEventRow>(
      'SELECT * FROM storm_events WHERE id = ? LIMIT 1',
      [id],
    );
    return rows.length > 0 ? rowToStormEvent(rows[0]) : null;
  },

  /** Fetch storm events filtered by storm type. */
  findByType(stormType: StormType): StormEvent[] {
    const rows = databaseService.query<StormEventRow>(
      'SELECT * FROM storm_events WHERE storm_type = ? ORDER BY created_at DESC',
      [stormType],
    );
    return rows.map(rowToStormEvent);
  },

  /** Update title, notes, or stormType for an existing storm event. */
  update(
    id: string,
    updates: Partial<Pick<StormEvent, 'title' | 'notes' | 'stormType'>>,
  ): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.stormType !== undefined) {
      fields.push('storm_type = ?');
      values.push(updates.stormType);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);
    databaseService.execute(
      `UPDATE storm_events SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  },

  /** Delete a storm event by id. */
  delete(id: string): void {
    databaseService.execute('DELETE FROM storm_events WHERE id = ?', [id]);
  },

  /** Return the total count of saved storm events. */
  count(): number {
    const rows = databaseService.query<{total: number}>(
      'SELECT COUNT(*) as total FROM storm_events',
    );
    return rows[0]?.total ?? 0;
  },
};
