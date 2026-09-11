const session = require('express-session');
const db = require('./db/database');

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires INTEGER NOT NULL
)`);

// Occasionally clear out old, expired sessions so the table doesn't grow forever.
function cleanupExpired() {
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
}
cleanupExpired();
setInterval(cleanupExpired, 1000 * 60 * 60).unref();

class SqliteSessionStore extends session.Store {
  get(sid, callback) {
    try {
      const row = db.prepare('SELECT data, expires FROM sessions WHERE sid = ?').get(sid);
      if (!row || row.expires < Date.now()) return callback(null, null);
      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const maxAge = (sessionData.cookie && sessionData.cookie.maxAge) || 1000 * 60 * 60 * 8;
      const expires = Date.now() + maxAge;
      const data = JSON.stringify(sessionData);
      db.prepare(`
        INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires = excluded.expires
      `).run(sid, data, expires);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  touch(sid, sessionData, callback) {
    this.set(sid, sessionData, callback || (() => {}));
  }
}

module.exports = SqliteSessionStore;
