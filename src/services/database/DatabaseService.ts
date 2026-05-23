import SQLite, {
  SQLiteDatabase,
  Transaction,
  ResultSet,
  SQLError,
} from 'react-native-sqlite-storage';
import {DB_NAME, MIGRATIONS} from './schema';

// Enable promise-based API
SQLite.enablePromise(true);

/**
 * DatabaseService — singleton that manages the SQLite connection
 * and runs schema migrations on first open.
 */
class DatabaseService {
  private db: SQLiteDatabase | null = null;

  /** Open (or reuse) the database connection and run pending migrations. */
  async open(): Promise<SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }

    this.db = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    });

    await this.runMigrations(this.db);
    return this.db;
  }

  /** Close the database connection. */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a SQL statement that modifies data (INSERT / UPDATE / DELETE).
   * Returns the ResultSet so callers can inspect insertId / rowsAffected.
   */
  async execute(sql: string, params: unknown[] = []): Promise<ResultSet> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      database.transaction((tx: Transaction) => {
        tx.executeSql(
          sql,
          params as (string | number | null)[],
          (_tx: Transaction, result: ResultSet) => resolve(result),
          (_tx: Transaction, error: SQLError) => {
            reject(error);
            return true; // rollback
          },
        );
      });
    });
  }

  /**
   * Execute a SELECT statement and return typed rows.
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      database.readTransaction((tx: Transaction) => {
        tx.executeSql(
          sql,
          params as (string | number | null)[],
          (_tx: Transaction, result: ResultSet) => {
            const rows: T[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              rows.push(result.rows.item(i) as T);
            }
            resolve(rows);
          },
          (_tx: Transaction, error: SQLError) => {
            reject(error);
            return true;
          },
        );
      });
    });
  }

  /** Run all migration statements in order inside a single transaction. */
  private async runMigrations(database: SQLiteDatabase): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      database.transaction(
        (tx: Transaction) => {
          for (const sql of MIGRATIONS) {
            tx.executeSql(
              sql,
              [],
              undefined,
              (_tx: Transaction, error: SQLError) => {
                console.error('[DB] Migration failed:', sql, error);
                return true; // rollback
              },
            );
          }
        },
        (error: SQLError) => reject(error),
        () => resolve(),
      );
    });
  }
}

// Export a single shared instance
export const databaseService = new DatabaseService();
