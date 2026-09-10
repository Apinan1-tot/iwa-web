const db = require('./database');
const bcrypt = require('bcryptjs');

function upsertCategory(cat) {
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cat.slug);
  if (existing) return existing.id;
  const info = db.prepare(
    `INSERT INTO categories (slug, name, eyebrow, description, sort_order) VALUES (?, ?, ?, ?, ?)`
  ).run(cat.slug, cat.name, cat.eyebrow, cat.description, cat.sort_order);
  return info.lastInsertRowid;
}

function upsertProduct(categoryId, p) {
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
  if (existing) return existing.id;
  const row = {
    category_id: categoryId,
    slug: p.slug,
    name: p.name,
    label: p.label || '',
    summary: p.summary || '',
    description: p.description || '',
    image: p.image || '',
    meta_tags: p.meta_tags || '',
    highlight_title: p.highlight_title || '',
    highlight_body: p.highlight_body || '',
    sort_order: p.sort_order || 0
  };
  const info = db.prepare(`
    INSERT INTO products (category_id, slug, name, label, summary, description, image, meta_tags, highlight_title, highlight_body, sort_order)
    VALUES (@category_id, @slug, @name, @label, @summary, @description, @image, @meta_tags, @highlight_title, @highlight_body, @sort_order)
  `).run(row);
  return info.lastInsertRowid;
}

const categories = [
  { slug: 'digital-learning', name: "หลักสูตรภาษาอังกฤษสำหรับเด็ก", eyebrow: "CHILDREN'S ENGLISH", description: 'ตัวอย่างหลักสูตรภาษาอังกฤษสำหรับผู้เรียนวัยเริ่มต้น', sort_order: 1 },
  { slug: 'communicative-english', name: 'หลักสูตรภาษาอังกฤษเพื่อการสื่อสาร', eyebrow: 'COMMUNICATIVE ENGLISH', description: 'เสริมทักษะภาษาอังกฤษเพื่อใช้ได้จริงในชีวิตประจำวัน', sort_order: 2 },
  { slug: 'preschool-multimedia', name: 'สื่อมัลติมีเดียระดับปฐมวัย', eyebrow: 'PRESCHOOL MULTIMEDIA', description: 'สื่อดิจิทัลสำหรับเด็กปฐมวัย พร้อมภาพรวมผลิตภัณฑ์แบบเข้าใจง่าย', sort_order: 3 },
  { slug: 'primary-multimedia', name: 'สื่อมัลติมีเดียระดับประถมศึกษา', eyebrow: 'PRIMARY MULTIMEDIA', description: 'สื่อดิจิทัลสำหรับนักเรียนประถมศึกษา พร้อมภาพรวมผลิตภัณฑ์แบบเข้าใจง่าย', sort_order: 4 },
  { slug: 'iwa-smart-board', name: 'Iwa AiBoard', eyebrow: 'SMART CLASSROOM · INTERACTIVE DISPLAY', description: 'จออัจฉริยะแบบ All-in-One สำหรับการเรียนการสอน ห้องประชุม และการนำเสนอ', sort_order: 5 },
  { slug: 'assessment', name: 'การประเมินและวิเคราะห์ผล', eyebrow: 'ASSESSMENT & ANALYTICS', description: 'พื้นที่สำหรับเครื่องมือวัดผลและข้อมูลที่ช่วยให้วางแผนการพัฒนาได้อย่างมีข้อมูลรองรับ', sort_order: 6 },
  { slug: 'smart-classroom', name: 'ห้องเรียนอัจฉริยะ', eyebrow: 'SMART CLASSROOM', description: 'พื้นที่สำหรับเทคโนโลยีและอุปกรณ์ที่ช่วยให้ทุกการเรียนรู้เกิดขึ้นได้อย่างมีประสิทธิภาพ', sort_order: 7 },
  { slug: 'ict-infrastructure', name: 'โครงสร้างพื้นฐาน ICT', eyebrow: 'ICT INFRASTRUCTURE', description: 'พื้นที่สำหรับระบบเครือข่าย อุปกรณ์ และโซลูชันที่ช่วยให้องค์กรทำงานได้อย่างต่อเนื่องและปลอดภัย', sort_order: 8 }
];

const catIds = {};
for (const c of categories) catIds[c.slug] = upsertCategory(c);

const products = [
  // Children's English
  { slug: 'phonics-hero', category: 'digital-learning', name: 'Phonics Hero', label: "หลักสูตรภาษาอังกฤษสำหรับเด็ก", summary: 'หน้าสำหรับแสดงข้อมูลหลักสูตรและสื่อประกอบเมื่อได้รับอนุญาตให้นำมาใช้บนเว็บไซต์', description: 'หลักสูตรที่วางเส้นทางการเรียนรู้โฟนิคส์ผ่านกิจกรรม ตั้งแต่การรู้จักเสียง การอ่าน การผสมคำ ไปจนถึงการอ่านคำที่มีสระเสียงยาว', image: '/assets/img/products/phonics-hero.png', meta_tags: 'ข้อมูลอยู่ระหว่างจัดเตรียม', highlight_title: 'เหมาะสำหรับการเรียนรู้เป็นลำดับ', highlight_body: 'เนื้อหาใช้แบบฝึกและภาพประกอบเพื่อช่วยให้ผู้เรียนติดตามการเรียนรู้ได้อย่างเป็นขั้นตอน', sort_order: 1 },
  { slug: 'picaro-english', category: 'digital-learning', name: 'Picaro English', label: "หลักสูตรภาษาอังกฤษสำหรับเด็ก", summary: 'หน้าสำหรับแสดงข้อมูลหลักสูตรและสื่อประกอบเมื่อได้รับอนุญาตให้นำมาใช้บนเว็บไซต์', description: 'หลักสูตรภาษาอังกฤษแบบผสมผสานที่นำการผจญภัยและกิจกรรมเกมมาเป็นส่วนหนึ่งของประสบการณ์เรียนรู้สำหรับเด็ก', image: '/assets/img/products/picaro-english.png', meta_tags: 'ข้อมูลอยู่ระหว่างจัดเตรียม', highlight_title: 'เรียนรู้ผ่านโลกของ Picaro', highlight_body: 'ใช้เรื่องราว ภาพ และกิจกรรมเพื่อช่วยสร้างความสนใจและความมั่นใจในการเรียนภาษาอังกฤษ', sort_order: 2 },
  // Communicative English
  { slug: 'vantage-connected-learn-social', category: 'communicative-english', name: 'Vantage Connected Learn Social', label: 'หลักสูตรภาษาอังกฤษเพื่อการสื่อสาร', summary: 'การเรียนภาษาอังกฤษเพื่อการสื่อสารตามกรอบ CEFR พร้อมการเรียนแบบโต้ตอบและการติดตามความก้าวหน้า', description: 'แพลตฟอร์มสำหรับการเรียนภาษาอังกฤษเพื่อการสื่อสาร ที่ผสานการเรียนแบบโต้ตอบ การฝึกฟัง และการติดตามผลไว้ในประสบการณ์เดียว', image: '/assets/img/products/vantage-connected-learn-social.png', meta_tags: 'CEFR,Interactive Learning', highlight_title: 'ภาพรวมการใช้งาน', highlight_body: 'ผู้เรียนเข้าถึงบทเรียนได้จากหลายอุปกรณ์ ฝึกตามเนื้อหา ดูความก้าวหน้า และเรียนรู้ต่อเนื่องตามจังหวะของตนเอง', sort_order: 1 },
  // Preschool multimedia (8)
  { slug: 'click2plearn', category: 'preschool-multimedia', name: 'Click2Plearn', label: 'EARLY LEARNING', summary: 'สื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ของเด็กปฐมวัย', description: 'สื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ของเด็กปฐมวัย', image: '/assets/img/products/preschool/click2plearn.png', meta_tags: 'กิจกรรมการเรียนรู้', sort_order: 1 },
  { slug: 'thai', category: 'preschool-multimedia', name: 'พัฒนาทักษะการใช้ภาษา', label: 'ACTIV@TEACH · LANGUAGE', summary: 'โปรแกรมสื่อมัลติมีเดียเพื่อพัฒนาทักษะการใช้ภาษาสำหรับเด็กปฐมวัย', description: 'โปรแกรมสื่อมัลติมีเดียเพื่อพัฒนาทักษะการใช้ภาษาสำหรับเด็กปฐมวัย', image: '/assets/img/products/preschool/activateach-thai.png', meta_tags: 'ภาษา', sort_order: 2 },
  { slug: 'math', category: 'preschool-multimedia', name: 'พัฒนาทักษะทางคณิตศาสตร์', label: 'ACTIV@TEACH · MATH', summary: 'โปรแกรมสื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ด้านคณิตศาสตร์ระดับปฐมวัย', description: 'โปรแกรมสื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ด้านคณิตศาสตร์ระดับปฐมวัย', image: '/assets/img/products/preschool/activateach-math.png', meta_tags: 'คณิตศาสตร์', sort_order: 3 },
  { slug: 'science', category: 'preschool-multimedia', name: 'พัฒนาทักษะทางวิทยาศาสตร์', label: 'ACTIV@TEACH · SCIENCE', summary: 'โปรแกรมสื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ด้านวิทยาศาสตร์ระดับปฐมวัย', description: 'โปรแกรมสื่อมัลติมีเดียสำหรับกิจกรรมการเรียนรู้ด้านวิทยาศาสตร์ระดับปฐมวัย', image: '/assets/img/products/preschool/activateach-science.png', meta_tags: 'วิทยาศาสตร์', sort_order: 4 },
  { slug: 'thinking', category: 'preschool-multimedia', name: 'พัฒนาทักษะกระบวนการคิด', label: 'ACTIV@TEACH · THINKING', summary: 'โปรแกรมสื่อมัลติมีเดียเพื่อเสริมกระบวนการคิดและเชาวน์ปัญญาสำหรับเด็กปฐมวัย', description: 'โปรแกรมสื่อมัลติมีเดียเพื่อเสริมกระบวนการคิดและเชาวน์ปัญญาสำหรับเด็กปฐมวัย', image: '/assets/img/products/preschool/activateach-thinking.png', meta_tags: 'กระบวนการคิด', sort_order: 5 },
  { slug: 'asean', category: 'preschool-multimedia', name: 'ชุดอาเซียนน่ารู้', label: 'EARLY LEARNING', summary: 'สื่อมัลติมีเดียประกอบการเรียนรู้เรื่องอาเซียนสำหรับเด็กปฐมวัย', description: 'สื่อมัลติมีเดียประกอบการเรียนรู้เรื่องอาเซียนสำหรับเด็กปฐมวัย', image: '/assets/img/products/preschool/asean.png', meta_tags: 'อาเซียน', sort_order: 6 },
  { slug: 'smart-quiz', category: 'preschool-multimedia', name: 'Smart Quiz v1.0', label: 'ASSESSMENT', summary: 'คลังข้อสอบและระบบวัดผลสำหรับเด็กปฐมวัย', description: 'คลังข้อสอบและระบบวัดผลสำหรับเด็กปฐมวัย', image: '/assets/img/products/preschool/smart-quiz.png', meta_tags: 'ประเมินผล', sort_order: 7 },
  { slug: 'elearning-teacher', category: 'preschool-multimedia', name: 'E-Learning สำหรับครูปฐมวัย', label: 'E-LEARNING · TEACHER', summary: 'บทเรียนอิเล็กทรอนิกส์รูปแบบมัลติมีเดียและเครื่องมือจัดการการเรียนรู้สำหรับครูปฐมวัย', description: 'บทเรียนอิเล็กทรอนิกส์รูปแบบมัลติมีเดียและเครื่องมือจัดการการเรียนรู้สำหรับครูปฐมวัย', image: '/assets/img/products/preschool/elearning-teacher.png', meta_tags: 'e-Learning สำหรับครู', sort_order: 8 },
  // Primary multimedia (4)
  { slug: 'digital-library', category: 'primary-multimedia', name: 'คลังสื่อดิจิทัลสำหรับทุกบทเรียน', label: 'DIGITAL LIBRARY', summary: 'คลังสื่อดิจิทัลสำหรับนักเรียนประถมศึกษา ครอบคลุม 8 กลุ่มสาระการเรียนรู้', description: 'คลังสื่อดิจิทัลสำหรับนักเรียนระดับประถมศึกษา ครอบคลุม 8 กลุ่มสาระการเรียนรู้', image: '/assets/img/products/primary/digital-library-school.png', meta_tags: 'ป.1–ป.6', sort_order: 1 },
  { slug: 'thai-primary', category: 'primary-multimedia', name: 'อ่านออก เขียนได้ ง่ายนิดเดียว', label: 'THAI LANGUAGE', summary: 'สื่อมัลติมีเดียพัฒนาทักษะการอ่าน การเขียน และภาษาไทยระดับประถมศึกษา', description: 'โปรแกรมสื่อมัลติมีเดียเพื่อพัฒนาทักษะการอ่าน การเขียน และภาษาไทยระดับประถมศึกษา', image: '/assets/img/products/primary/thai-primary.png', meta_tags: 'ภาษาไทย', sort_order: 2 },
  { slug: 'math-primary', category: 'primary-multimedia', name: 'โปรแกรมพัฒนาทักษะคณิตศาสตร์', label: 'MATHEMATICS', summary: 'สื่อมัลติมีเดียสำหรับเสริมการเรียนรู้คณิตศาสตร์ระดับประถมศึกษา', description: 'โปรแกรมสื่อมัลติมีเดียพัฒนาทักษะการเรียนรู้คณิตศาสตร์สำหรับนักเรียนระดับประถมศึกษา', image: '/assets/img/products/primary/math-primary.png', meta_tags: 'คณิตศาสตร์', sort_order: 3 },
  { slug: 'science-primary', category: 'primary-multimedia', name: 'โปรแกรมพัฒนาทักษะวิทยาศาสตร์', label: 'SCIENCE', summary: 'สื่อมัลติมีเดียสำหรับเสริมการเรียนรู้วิทยาศาสตร์ระดับประถมศึกษา', description: 'โปรแกรมสื่อมัลติมีเดียพัฒนาทักษะการเรียนรู้วิทยาศาสตร์สำหรับนักเรียนระดับประถมศึกษา', image: '/assets/img/products/primary/science-primary.png', meta_tags: 'วิทยาศาสตร์', sort_order: 4 },
  // Iwa AiBoard (3 sizes)
  { slug: 'aiboard-65', category: 'iwa-smart-board', name: 'Iwa AiBoard 65″', label: 'INTERACTIVE DISPLAY', summary: 'รุ่นขนาด 65 นิ้ว พร้อมข้อมูล Display, Touch, Sound, Camera และ System', description: 'จอแสดงผลอัจฉริยะแบบ Interactive Display ชนิด All-in-One ขนาด 65 นิ้ว ความละเอียด 4K พร้อม Dual OS, AI Camera และ Whiteboard Software', image: '/assets/img/page-65.png', meta_tags: '65″,4K UHD', sort_order: 1 },
  { slug: 'aiboard-75', category: 'iwa-smart-board', name: 'Iwa AiBoard 75″', label: 'INTERACTIVE DISPLAY', summary: 'รุ่นขนาด 75 นิ้ว พร้อมฟังก์ชัน All-in-One ตามเอกสารผลิตภัณฑ์', description: 'จอแสดงผลอัจฉริยะแบบ Interactive Display ชนิด All-in-One ขนาด 75 นิ้ว ความละเอียด 4K พร้อม Dual OS, AI Camera และ Whiteboard Software', image: '/assets/img/page-75.png', meta_tags: '75″,4K UHD', sort_order: 2 },
  { slug: 'aiboard-86', category: 'iwa-smart-board', name: 'Iwa AiBoard 86″', label: 'INTERACTIVE DISPLAY', summary: 'รุ่นขนาด 86 นิ้ว สำหรับการเรียน การประชุม และการนำเสนอ', description: 'จอแสดงผลอัจฉริยะแบบ Interactive Display ชนิด All-in-One ขนาด 86 นิ้ว ความละเอียด 4K พร้อม Dual OS, AI Camera และ Whiteboard Software', image: '/assets/img/page-86.png', meta_tags: '86″,4K UHD', sort_order: 3 }
];

for (const p of products) {
  const { category, ...rest } = p;
  upsertProduct(catIds[category], rest);
}

// Default admin account
const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('ChangeMe123!', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('✔ Created default admin — username: admin / password: ChangeMe123!  (โปรดเปลี่ยนรหัสผ่านทันทีหลังล็อกอินครั้งแรก)');
} else {
  console.log('Admin account already exists, skipping.');
}

console.log('✔ Seed complete. Categories:', categories.length, 'Products:', products.length);
