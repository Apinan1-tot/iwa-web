const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/categories  -> list published categories with product counts
router.get('/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, (
      SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_published = 1
    ) AS product_count
    FROM categories c
    WHERE c.is_published = 1
    ORDER BY c.sort_order ASC, c.id ASC
  `).all();
  res.json(rows);
});

// GET /api/categories/:slug -> single published category
router.get('/categories/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ? AND is_published = 1').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'not_found' });
  res.json(cat);
});

// GET /api/products?category=slug -> published products, optionally filtered by category slug
router.get('/products', (req, res) => {
  const { category } = req.query;
  let rows;
  if (category) {
    rows = db.prepare(`
      SELECT p.* FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE c.slug = ? AND p.is_published = 1 AND c.is_published = 1
      ORDER BY p.sort_order ASC, p.id ASC
    `).all(category);
  } else {
    rows = db.prepare(`
      SELECT p.* FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = 1 AND c.is_published = 1
      ORDER BY p.sort_order ASC, p.id ASC
    `).all();
  }
  res.json(rows);
});

// GET /api/products/:slug -> single product with its extra images
router.get('/products/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.slug AS category_slug, c.name AS category_name
    FROM products p JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ? AND p.is_published = 1 AND c.is_published = 1
  `).get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'not_found' });
  product.images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(product.id);
  res.json(product);
});

module.exports = router;
