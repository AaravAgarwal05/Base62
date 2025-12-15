import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.SQLITE_PATH;
if (!dbPath) {
  throw new Error('SQLITE_PATH is not set.');
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');