const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const PORT = Number(process.env.PORT || 4000);
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TOKEN_SECRET = process.env.TOKEN_SECRET || "impacto-local-secret";
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const seedProjects = [
  { id: "p-solar", slug: "energia-solar-comunitaria", title: "Energia Solar Comunitaria", tagline: "Electrificacion limpia en zonas no interconectadas", category: "Energia", description: "Instalacion y mantenimiento de sistemas solares administrados por las comunidades.", location_name: "Choco y Amazonas", active: true, beneficiaries: 2140, budget: 185000, cover_image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80", reach_score: 68, innovation_score: 92, scalability_score: 74, benefits_score: 88, indicators: [{ id: "solar-i1", name: "Personas con energia", unit: "personas", target: 3000, achieved: 2160, category: "Alcance" }, { id: "solar-i2", name: "Sistemas instalados", unit: "sistemas", target: 100, achieved: 72, category: "Infraestructura" }], map_points: [{ id: "solar-m1", label: "Nuqui", lat: 5.713, lng: -77.265, status: "activo", description: "Centro comunitario solar" }, { id: "solar-m2", label: "Leticia", lat: -4.215, lng: -69.94, status: "activo", description: "Sistema escolar" }], life_stories: [{ id: "solar-s1", beneficiary_name: "Marta Rivas", age: 42, community: "Nuqui", quote: "Ahora podemos estudiar y trabajar cuando cae la noche.", impact: "Mayor acceso a educacion", photo_url: "" }], media: [{ id: "solar-media1", kind: "foto", title: "Paneles comunitarios", url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1000&q=80" }], reports: [], milestones: [] },
  { id: "p-huertos", slug: "huertos-sostenibles", title: "Huertos Sostenibles Comunitarios", tagline: "Seguridad alimentaria con agroecologia urbana", category: "Agricultura", description: "Huertos urbanos y formacion en practicas agroecologicas para familias y colectivos.", location_name: "Medellin y Bogota", active: true, beneficiaries: 1890, budget: 92000, cover_image: "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=1200&q=80", reach_score: 66, innovation_score: 71, scalability_score: 78, benefits_score: 83, indicators: [{ id: "garden-i1", name: "Familias vinculadas", unit: "familias", target: 2400, achieved: 1896, category: "Alcance" }], map_points: [{ id: "garden-m1", label: "Medellin", lat: 6.244, lng: -75.581, status: "activo", description: "Huerto barrial" }, { id: "garden-m2", label: "Bogota", lat: 4.711, lng: -74.072, status: "activo", description: "Red de huertos" }], life_stories: [], media: [], reports: [], milestones: [] },
  { id: "p-aulas", slug: "aulas-digitales-rurales", title: "Aulas Digitales Rurales", tagline: "Educacion con tecnologia en escuelas veredales", category: "Educacion", description: "Conectividad, dispositivos y acompanamiento docente para escuelas rurales.", location_name: "Boyaca y Cauca, Colombia", active: true, beneficiaries: 2400, budget: 154000, cover_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80", reach_score: 81, innovation_score: 76, scalability_score: 89, benefits_score: 85, indicators: [{ id: "class-i1", name: "Estudiantes beneficiados", unit: "estudiantes", target: 2650, achieved: 2385, category: "Alcance" }], map_points: [{ id: "class-m1", label: "Tunja", lat: 5.535, lng: -73.367, status: "activo", description: "Aula conectada" }], life_stories: [], media: [], reports: [], milestones: [] },
  { id: "p-agua", slug: "agua-limpia-guajira", title: "Agua Limpia para la Guajira", tagline: "Acceso sostenible a agua potable en comunidades Wayuu", category: "Agua", description: "Sistemas de captacion, almacenamiento y tratamiento de agua gestionados localmente.", location_name: "Alta Guajira, Colombia", active: true, beneficiaries: 1400, budget: 127000, cover_image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80", reach_score: 74, innovation_score: 84, scalability_score: 76, benefits_score: 93, indicators: [{ id: "water-i1", name: "Personas con agua segura", unit: "personas", target: 1600, achieved: 1392, category: "Beneficio" }], map_points: [{ id: "water-m1", label: "Uribia", lat: 11.713, lng: -72.266, status: "activo", description: "Punto de agua comunitario" }], life_stories: [], media: [], reports: [], milestones: [] }
];

function readDb() {
  if (!fs.existsSync(DB_FILE)) writeDb({ projects: [] });
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function writeDb(db) {
  const temporary = `${DB_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temporary, DB_FILE);
}
function tokenFor(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
function userFromToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  return data.exp > Date.now() ? { email: data.email, name: "Administrador" } : null;
}
function requireAuth(req, res, next) {
  try {
    const user = userFromToken((req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
    if (!user) return res.status(401).json({ detail: "Autenticacion requerida" });
    req.user = user;
    next();
  } catch { res.status(401).json({ detail: "Token invalido" }); }
}
function getSummary(projects) {
  const active = projects.filter((project) => project.active);
  const indicators = active.flatMap((project) => project.indicators || []);
  const targets = indicators.reduce((sum, item) => sum + Number(item.target || 0), 0);
  const achieved = indicators.reduce((sum, item) => sum + Number(item.achieved || 0), 0);
  const by_category = active.reduce((result, project) => { result[project.category] = (result[project.category] || 0) + 1; return result; }, {});
  return { total_projects: active.length, total_beneficiaries: active.reduce((sum, project) => sum + Number(project.beneficiaries || 0), 0), completion_rate: targets ? Math.round((achieved / targets) * 1000) / 10 : 0, by_category };
}
function normalizeMediaAlbums(media, projectSlug) {
  const counts = media.reduce((result, item) => {
    if (!item.group_id && item.title) result[item.title] = (result[item.title] || 0) + 1;
    return result;
  }, {});
  const albumIds = {};
  const grouped = media.map((item) => {
    if (item.group_id || !item.title || counts[item.title] < 2) return item;
    const groupId = albumIds[item.title] || (albumIds[item.title] = `album-${projectSlug}-${crypto.createHash("sha1").update(item.title).digest("hex").slice(0, 10)}`);
    return { ...item, group_id: groupId, group_title: item.title, album: true };
  });
  const covers = {};
  return grouped.map((item, _, all) => {
    if (!item.album) return item;
    if (!covers[item.group_id]) {
      const members = all.filter((candidate) => candidate.group_id === item.group_id && candidate.kind === "foto");
      if (members.length) covers[item.group_id] = members[Math.floor(Math.random() * members.length)].id;
    }
    return item.id === covers[item.group_id] ? { ...item, is_cover: true } : { ...item, is_cover: false };
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));
const storage = multer.diskStorage({ destination: UPLOAD_DIR, filename: (_, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`) });
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (email !== (process.env.ADMIN_EMAIL || "admin") || password !== (process.env.ADMIN_PASSWORD || "admin123")) return res.status(401).json({ detail: "Usuario o contrasena incorrectos" });
  res.json({ token: tokenFor(email), user: { email, name: "Administrador" } });
});
app.get("/api/auth/me", requireAuth, (req, res) => res.json(req.user));
app.get("/api/projects/summary", (_, res) => res.json(getSummary(readDb().projects)));
app.get("/api/projects", (req, res) => { const projects = readDb().projects; res.json(req.query.active_only === "true" ? projects.filter((item) => item.active) : projects); });
app.get("/api/projects/:slug", (req, res) => { const project = readDb().projects.find((item) => item.slug === req.params.slug); res.status(project ? 200 : 404).json(project || { detail: "Proyecto no encontrado" }); });
app.post("/api/projects", requireAuth, (req, res) => {
  const project = { ...req.body, id: req.body.id || crypto.randomUUID(), active: req.body.active !== false, indicators: req.body.indicators || [], map_points: req.body.map_points || [], life_stories: req.body.life_stories || [], media: normalizeMediaAlbums(req.body.media || [], req.body.slug || "nuevo"), reports: req.body.reports || [], milestones: req.body.milestones || [], seguimientos: req.body.seguimientos || [] };
  if (!project.slug || !project.title) return res.status(400).json({ detail: "slug y title son obligatorios" });
  const db = readDb();
  if (db.projects.some((item) => item.slug === project.slug)) return res.status(409).json({ detail: "El slug ya existe" });
  db.projects.push(project); writeDb(db); res.status(201).json(project);
});
app.patch("/api/projects/:slug", requireAuth, (req, res) => {
  const db = readDb(); const index = db.projects.findIndex((item) => item.slug === req.params.slug);
  if (index < 0) return res.status(404).json({ detail: "Proyecto no encontrado" });
  db.projects[index] = { ...db.projects[index], ...req.body, id: db.projects[index].id, slug: db.projects[index].slug, media: normalizeMediaAlbums(req.body.media || db.projects[index].media || [], db.projects[index].slug) }; writeDb(db); res.json(db.projects[index]);
});
app.delete("/api/projects/:slug", requireAuth, (req, res) => {
  const db = readDb(); const originalLength = db.projects.length; db.projects = db.projects.filter((item) => item.slug !== req.params.slug);
  if (originalLength === db.projects.length) return res.status(404).json({ detail: "Proyecto no encontrado" });
  writeDb(db); res.status(204).end();
});
app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ detail: "Archivo requerido" });
  res.status(201).json({ url: `/uploads/${req.file.filename}`, filename: req.file.originalname, size: req.file.size, content_type: req.file.mimetype });
});
const FRONTEND_DIST = path.join(FRONTEND_DIR, "dist");
const STATIC_DIR = fs.existsSync(FRONTEND_DIST) ? FRONTEND_DIST : FRONTEND_DIR;
app.use("/images", express.static(path.join(FRONTEND_DIR, "images")));
app.use(express.static(STATIC_DIR));
app.use((_, res) => res.sendFile(path.join(STATIC_DIR, "index.html")));
app.listen(PORT, () => console.log(`Impacto & Evidencias disponible en http://localhost:${PORT}`));