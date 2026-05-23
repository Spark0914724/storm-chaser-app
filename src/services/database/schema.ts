/**
 * Database schema definitions and migration scripts.
 * Add new migrations to the MIGRATIONS array — never edit existing ones.
 */

export const DB_NAME = 'StormChaser.db';
export const DB_VERSION = 1;

export const MIGRATIONS: string[] = [
  // v1 — initial schema
  `CREATE TABLE IF NOT EXISTS storm_events (
    id                TEXT PRIMARY KEY NOT NULL,
    photo_uri         TEXT NOT NULL,
    storm_type        TEXT NOT NULL,
    title             TEXT NOT NULL,
    notes             TEXT NOT NULL DEFAULT '',
    latitude          REAL NOT NULL,
    longitude         REAL NOT NULL,
    altitude          REAL,
    location_name     TEXT,
    temperature       REAL NOT NULL,
    feels_like        REAL NOT NULL DEFAULT 0,
    wind_speed        REAL NOT NULL,
    wind_direction    REAL NOT NULL DEFAULT 0,
    wind_gusts        REAL NOT NULL DEFAULT 0,
    precipitation     REAL NOT NULL,
    humidity          REAL NOT NULL,
    pressure          REAL NOT NULL,
    visibility        REAL NOT NULL DEFAULT 0,
    uv_index          REAL NOT NULL DEFAULT 0,
    weather_code      INTEGER NOT NULL,
    weather_desc      TEXT NOT NULL DEFAULT '',
    captured_at       TEXT NOT NULL,
    created_at        TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_storm_events_created_at
    ON storm_events (created_at DESC);`,

  `CREATE INDEX IF NOT EXISTS idx_storm_events_storm_type
    ON storm_events (storm_type);`,
];
