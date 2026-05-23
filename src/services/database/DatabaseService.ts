import {open, type DB, type Scalar} from '@op-engineering/op-sqlite';
import {DB_NAME, MIGRATIONS} from './schema';

/**
 * DatabaseService — singleton that manages the SQLite connection
 * and runs schema migrations on first open.
 */
class DatabaseService {
  private db: DB | null = null;

  /** Open (or reuse) the database connection and run pending migrations. */
  open(): DB {
    if (this.db) {
      return this.db;
    }
    this.db = open({name: DB_NAME});
    this.runMigrations(this.db);
    return this.db;
  }

  /** Close the database connection. */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a SQL statement that modifies data (INSERT / UPDATE / DELETE).
   */
  execute(sql: string, params: Scalar[] = []): void {
    const database = this.open();
    database.executeSync(sql, params);
  }

  /**
   * Execute a SELECT statement and return typed rows.
   */
  query<T = Record<string, Scalar>>(
    sql: string,
    params: Scalar[] = [],
  ): T[] {
    const database = this.open();
    const result = database.executeSync(sql, params);
    return (result.rows ?? []) as T[];
  }

  /** Run all migration statements in order. */
  private runMigrations(database: DB): void {
    for (const sql of MIGRATIONS) {
      try {
        database.executeSync(sql);
      } catch (error) {
        console.error('[DB] Migration failed:', sql, error);
        throw error;
      }
    }
  }
}

// Export a single shared instance
export const databaseService = new DatabaseService();
