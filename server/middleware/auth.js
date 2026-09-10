function requireLogin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
}

module.exports = { requireLogin };
