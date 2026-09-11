const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'site.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  eyebrow TEXT,
  description TEXT,
  image TEXT,
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  label TEXT,
  summary TEXT,
  description TEXT,
  image TEXT,
  meta_tags TEXT,
  highlight_title TEXT,
  highlight_body TEXT,
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  entity_name TEXT,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// --- Lightweight auto-migration for databases created before a column existed ---
// Safe to run every startup: only adds the column if it's missing, never touches existing data.
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✔ Migrated: added column "${column}" to "${table}"`);
  }
}
ensureColumn('categories', 'is_published', 'INTEGER DEFAULT 1');
ensureColumn('categories', 'image', 'TEXT');

// Records an entry in the activity log. Never throws — logging must never break the actual operation.
function logActivity({ adminUsername, action, entityType, entityId, entityName, details }) {
  try {
    db.prepare(`
      INSERT INTO activity_log (admin_username, action, entity_type, entity_id, entity_name, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminUsername || 'unknown', action, entityType, entityId || null, entityName || '', details || '');
  } catch (err) {
    console.error('activity log write failed:', err.message);
  }
}

module.exports = db;
module.exports.logActivity = logActivity;
