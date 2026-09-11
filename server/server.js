require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SqliteSessionStore = require('./session-store');
const path = require('path');

require('./db/database'); // ensures tables exist

const publicApi = require('./routes/public-api');
const adminAuth = require('./routes/admin-auth');
const adminApi = require('./routes/admin-api');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SqliteSessionStore(),
  secret: process.env.SESSION_SECRET || 'iwa-rich-you-d-change-this-secret-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD, // requires HTTPS in production
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// Static assets — served directly from the repo root to match the existing
// site layout (assets/, products/, uploads/ live at the project root).
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/products', express.static(path.join(__dirname, '..', 'products')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Admin panel static files (the admin UI itself — protected by client-side login check + API auth)
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// APIs
app.use('/api', publicApi);
app.use('/admin-api', adminAuth);
app.use('/admin-api', adminApi);

// Homepage (kept as the site's own existing index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send('ไม่พบหน้าที่ต้องการ (404)');
});

app.listen(PORT, () => {
  console.log(`✔ IWA RICH YOU D server running at http://localhost:${PORT}`);
  console.log(`  Storefront: http://localhost:${PORT}/`);
  console.log(`  Admin panel: http://localhost:${PORT}/admin`);
});
