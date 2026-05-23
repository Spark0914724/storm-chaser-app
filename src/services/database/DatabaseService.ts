import {QuickSQLite} from 'react-native-quick-sqlite';
import {DB_NAME, MIGRATIONS} from './schema';

/**
 * DatabaseService — singleton that manages the SQLite connection
 * and runs schema migrations on first open.
 */
class DatabaseService {
  private initialized = false;

  /** Open the database and run migrations (idempotent). */
  init(): void {
    if (this.initialized) {
      return;
    }
    QuickSQLite.open(DB_NAME);
    this.runMigrations();
    this.initialized = true;
  }

  /** Close the database connection. */
  close(): void {
    if (this.initialized) {
      QuickSQLite.close(DB_NAME);
      this.initialized = false;
    }
  }

  /**
   * Execute a SQL statement that modifies data (INSERT / UPDATE / DELETE).
   */
  execute(sql: string, params: any[] = []): void {
    this.init();
    QuickSQLite.execute(DB_NAME, sql, params);
  }

  /**
   * Execute a SELECT statement and return typed rows.
   */
  query<T = Record<string, any>>(sql: string, params: any[] = []): T[] {
    this.init();
    const result = QuickSQLite.execute(DB_NAME, sql, params);
    return (result.rows?._array ?? []) as T[];
  }

  /** Run all migration statements in order. */
  private runMigrations(): void {
    for (const sql of MIGRATIONS) {
      try {
        QuickSQLite.execute(DB_NAME, sql);
      } catch (error) {
        console.error('[DB] Migration failed:', sql, error);
        throw error;
      }
    }
  }
}

// Export a single shared instance
export const databaseService = new DatabaseService();
