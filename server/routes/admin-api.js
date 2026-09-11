const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { logActivity } = require('../db/database');
const { requireLogin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

router.use(requireLogin);

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'item-' + Date.now();
}

function log(req, action, entityType, entityId, entityName, details) {
  logActivity({
    adminUsername: (req.session && req.session.username) || 'unknown',
    action, entityType, entityId, entityName, details
  });
}

/* ---------- CATEGORIES ---------- */

router.get('/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c ORDER BY c.sort_order ASC, c.id ASC
  `).all();
  res.json(rows);
});

router.post('/categories', (req, res) => {
  const { name, eyebrow, description, image, sort_order } = req.body || {};
  if (!name) return res.status(400).json({ error: 'missing_name', message: 'กรุณาระบุชื่อหมวดหมู่' });
  let slug = slugify(name);
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
  if (existing) slug = slug + '-' + Date.now().toString(36);
  const info = db.prepare(`
    INSERT INTO categories (slug, name, eyebrow, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)
  `).run(slug, name, eyebrow || '', description || '', image || '', sort_order || 0);
  log(req, 'create', 'category', info.lastInsertRowid, name, '');
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/categories/:id', (req, res) => {
  const { name, eyebrow, description, image, sort_order, is_published } = req.body || {};
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'not_found' });
  const nextPublished = is_published === undefined ? cat.is_published : (is_published ? 1 : 0);
  db.prepare(`
    UPDATE categories SET name = ?, eyebrow = ?, description = ?, image = ?, sort_order = ?, is_published = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name ?? cat.name,
    eyebrow ?? cat.eyebrow,
    description ?? cat.description,
    image ?? cat.image,
    sort_order ?? cat.sort_order,
    nextPublished,
    cat.id
  );
  const wasToggleOnly = is_published !== undefined && name === undefined && eyebrow === undefined && description === undefined && image === undefined;
  if (wasToggleOnly) {
    log(req, nextPublished ? 'publish' : 'unpublish', 'category', cat.id, cat.name, '');
  } else {
    log(req, 'update', 'category', cat.id, name ?? cat.name, '');
  }
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(cat.id));
});

router.delete('/categories/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'not_found' });
  const count = db.prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?').get(cat.id).n;
  if (count > 0) {
    return res.status(400).json({ error: 'has_products', message: `ลบไม่ได้ เพราะยังมีสินค้า ${count} รายการในหมวดนี้ กรุณาย้ายหรือลบสินค้าก่อน` });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(cat.id);
  log(req, 'delete', 'category', cat.id, cat.name, '');
  res.json({ ok: true });
});

/* ---------- PRODUCTS ---------- */

router.get('/products', (req, res) => {
  const { category_id } = req.query;
  let rows;
  if (category_id) {
    rows = db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY sort_order ASC, id ASC').all(category_id);
  } else {
    rows = db.prepare(`
      SELECT p.*, c.name AS category_name FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY c.sort_order ASC, p.sort_order ASC, p.id ASC
    `).all();
  }
  res.json(rows);
});

router.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'not_found' });
  product.images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(product.id);
  res.json(product);
});

router.post('/products', (req, res) => {
  const { category_id, name, label, summary, description, image, meta_tags, highlight_title, highlight_body, sort_order, is_published } = req.body || {};
  if (!category_id || !name) return res.status(400).json({ error: 'missing_fields', message: 'กรุณาระบุหมวดหมู่และชื่อสินค้า' });
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
  if (!cat) return res.status(400).json({ error: 'invalid_category', message: 'ไม่พบหมวดหมู่ที่เลือก' });
  let slug = slugify(name);
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
  if (existing) slug = slug + '-' + Date.now().toString(36);
  const info = db.prepare(`
    INSERT INTO products (category_id, slug, name, label, summary, description, image, meta_tags, highlight_title, highlight_body, sort_order, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(category_id, slug, name, label || '', summary || '', description || '', image || '', meta_tags || '', highlight_title || '', highlight_body || '', sort_order || 0, is_published === false ? 0 : 1);
  log(req, 'create', 'product', info.lastInsertRowid, name, `หมวดหมู่: ${cat.name}`);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'not_found' });
  const b = req.body || {};
  const merged = {
    category_id: b.category_id ?? product.category_id,
    name: b.name ?? product.name,
    label: b.label ?? product.label,
    summary: b.summary ?? product.summary,
    description: b.description ?? product.description,
    image: b.image ?? product.image,
    meta_tags: b.meta_tags ?? product.meta_tags,
    highlight_title: b.highlight_title ?? product.highlight_title,
    highlight_body: b.highlight_body ?? product.highlight_body,
    sort_order: b.sort_order ?? product.sort_order,
    is_published: b.is_published === undefined ? product.is_published : (b.is_published ? 1 : 0)
  };
  db.prepare(`
    UPDATE products SET category_id=?, name=?, label=?, summary=?, description=?, image=?, meta_tags=?, highlight_title=?, highlight_body=?, sort_order=?, is_published=?, updated_at=datetime('now')
    WHERE id = ?
  `).run(merged.category_id, merged.name, merged.label, merged.summary, merged.description, merged.image, merged.meta_tags, merged.highlight_title, merged.highlight_body, merged.sort_order, merged.is_published, product.id);
  const isToggleOnly = b.is_published !== undefined && Object.keys(b).length === 1;
  if (isToggleOnly) {
    log(req, merged.is_published ? 'publish' : 'unpublish', 'product', product.id, merged.name, '');
  } else {
    log(req, 'update', 'product', product.id, merged.name, '');
  }
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(product.id));
});

router.delete('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'not_found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(product.id);
  log(req, 'delete', 'product', product.id, product.name, '');
  res.json({ ok: true });
});

/* ---------- EXTRA GALLERY IMAGES PER PRODUCT ---------- */

router.post('/products/:id/images', (req, res) => {
  const { image, caption, sort_order } = req.body || {};
  if (!image) return res.status(400).json({ error: 'missing_image' });
  const info = db.prepare('INSERT INTO product_images (product_id, image, caption, sort_order) VALUES (?, ?, ?, ?)')
    .run(req.params.id, image, caption || '', sort_order || 0);
  res.json(db.prepare('SELECT * FROM product_images WHERE id = ?').get(info.lastInsertRowid));
});

router.delete('/product-images/:id', (req, res) => {
  db.prepare('DELETE FROM product_images WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- ACTIVITY LOG ---------- */

router.get('/activity-log', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT ?').all(limit);
  res.json(rows);
});

/* ---------- IMAGE UPLOAD ---------- */
// Uploads image, auto-resizes to a reasonable max width, and returns its public URL.
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file', message: 'ไม่พบไฟล์รูปภาพ' });
  try {
    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    // Resize down if larger than 1600px wide, keep aspect ratio, skip for gif
    if (ext !== '.gif') {
      const buffer = fs.readFileSync(filePath);
      const resized = await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .toBuffer();
      fs.writeFileSync(filePath, resized);
    }
    const publicUrl = '/uploads/' + path.basename(filePath);
    res.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'processing_failed', message: 'ไม่สามารถประมวลผลรูปภาพได้' });
  }
});

module.exports = router;
