import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MapView from "@/components/MapView";
import { ArrowLeft, Download, MapPin, Quote, FileText, Image as ImageIcon, Video, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

function groupMedia(items) {
  return items.reduce((groups, item, index) => {
    const id = item.album_id || item.group_id || `single-${index}`;
    const existing = groups.find((group) => group.id === id);
    if (existing) {
      existing.items.push(item);
      existing.items.sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)));
    } else groups.push({ id, title: item.album_title || item.group_title || "", isAlbum: Boolean(item.album || item.album_id), items: [item] });
    return groups;
  }, []);
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${slug}`).then((r) => setProject(r.data)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && project && location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, project, location.hash]);

  if (loading) return <div className="max-w-7xl mx-auto p-8 text-slate-500">Cargando⬦</div>;
  if (!project) return <div className="max-w-7xl mx-auto p-8">Proyecto no encontrado. <Link to="/" className="text-emerald-700">Volver</Link></div>;

  const totalTarget = (project.indicators || []).reduce((s, i) => s + (i.target || 0), 0);
  const totalAchieved = (project.indicators || []).reduce((s, i) => s + (i.achieved || 0), 0);
  const overallPct = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  const radarData = [
    { dim: "Alcance", value: project.reach_score || 0 },
    { dim: "Innovación", value: project.innovation_score || 0 },
    { dim: "Escalabilidad", value: project.scalability_score || 0 },
    { dim: "Beneficios", value: project.benefits_score || 0 },
    { dim: "Evidencias", value: Math.min(100, (project.media?.length || 0) * 20 + (project.reports?.length || 0) * 30) },
  ];

  const photos = (project.media || []).filter((m) => m.kind === "foto");
  const videos = (project.media || []).filter((m) => m.kind === "video");
  const photoGroups = groupMedia(photos);
  const videoGroups = groupMedia(videos);

  const seguimientoStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("complet")) return { background: "#6B7F3E" };
    if (s.includes("atras") || s.includes("riesgo")) return { background: "#C75A3B" };
    if (s.includes("pendient")) return { background: "#D99B64" };
    return { background: "#0F5D7A" };
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative">
        <div className="h-72 md:h-96 bg-slate-900 relative overflow-hidden">
          {project.cover_image && <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover opacity-70" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
          <Link to="/proyectos" className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white mb-4" data-testid="back-to-projects">
            <ArrowLeft className="w-4 h-4" /> Todas las iniciativas
          </Link>
          <Badge className="bg-emerald-600 text-white border-0 rounded-full mb-3 font-mono-accent uppercase text-xs">{project.category}</Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">{project.title}</h1>
          <p className="mt-3 text-lg text-white/85 max-w-3xl">{project.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-white/85 text-sm">
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location_name}</div>
            {project.start_date && <div>Inicio: <span className="font-mono-accent">{project.start_date}</span></div>}
            {project.budget && <div>Presupuesto: <span className="font-mono-accent">USD {project.budget.toLocaleString()}</span></div>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Overall progress + Radar */}
        <section className="grid lg:grid-cols-5 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Progreso global</div>
            <div className="font-display text-5xl font-extrabold text-slate-900">{overallPct}%</div>
            <div className="text-sm text-slate-500 mt-1">Logros vs metas planeadas</div>
            <Progress value={overallPct} className="mt-4 h-2" />
            <p className="mt-6 text-sm text-slate-600 leading-relaxed">{project.description}</p>
          </Card>
          <Card className="p-6 lg:col-span-3">
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-4">Evaluación por dimensiones</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: "#0F172A", fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <Radar name="Puntaje" dataKey="value" stroke="#047857" fill="#047857" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* Indicators */}
        <section>
          <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Indicadores</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">Metas vs Logros</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(project.indicators || []).map((ind) => {
              const pct = ind.target ? Math.round((ind.achieved / ind.target) * 100) : 0;
              return (
                <Card key={ind.id} className="p-5" data-testid={`indicator-${ind.id}`}>
                  <div className="text-xs text-slate-500 uppercase font-mono-accent tracking-wider">{ind.category || "indicador"}</div>
                  <div className="mt-1 font-display font-semibold text-slate-900">{ind.name}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-display font-extrabold text-emerald-800">{ind.achieved.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 font-mono-accent">de {ind.target.toLocaleString()} {ind.unit}</div>
                    </div>
                    <div className="text-lg font-mono-accent text-slate-900 font-semibold">{pct}%</div>
                  </div>
                  <Progress value={pct} className="mt-3 h-1.5" />
                </Card>
              );
            })}
          </div>
        </section>

        {/* Map */}
        {(project.map_points || []).length > 0 && (
          <section>
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">
              <MapPin className="w-3 h-3 inline mr-1" /> Ubicaciones de intervención
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">Mapa de impacto territorial</h2>
            <MapView points={project.map_points} height={480} />
          </section>
        )}

        {/* Life stories */}
        {(project.life_stories || []).length > 0 && (
          <section>
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Historias de vida</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">Voces de las comunidades</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(project.life_stories || []).map((s) => (
                <Card key={s.id} className="p-6 flex gap-5" data-testid={`story-${s.id}`}>
                  {s.photo_url && (
                    <img src={s.photo_url} alt={s.beneficiary_name} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
                  )}
                  <div>
                    <Quote className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="text-slate-800 italic leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
                    <div className="mt-3 text-sm">
                      <div className="font-display font-semibold text-slate-900">{s.beneficiary_name}{s.age ? `, ${s.age}` : ""}</div>
                      <div className="text-slate-500">{s.community} · {s.impact}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Media + Reports */}
        <section>
          <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Evidencias</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">Galería multimedia e informes</h2>
          <Tabs defaultValue="fotos">
            <TabsList>
              <TabsTrigger value="fotos" data-testid="tab-fotos"><ImageIcon className="w-4 h-4 mr-1" /> Fotos ({photos.length})</TabsTrigger>
              <TabsTrigger value="videos" data-testid="tab-videos"><Video className="w-4 h-4 mr-1" /> Videos ({videos.length})</TabsTrigger>
              <TabsTrigger value="informes" data-testid="tab-informes"><FileText className="w-4 h-4 mr-1" /> Informes ({(project.reports || []).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="fotos" className="mt-6">
              <div className="space-y-8">
                {photoGroups.map((group) => {
                  const galleryItems = group.isAlbum ? [group.items.find((item) => item.is_cover) || group.items[0]] : group.items;
                  return (
                  <div key={group.id}>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {galleryItems.map((m) => (
                        <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="group block relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                          <img src={m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 text-white text-sm font-medium">{m.title}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                  );
                })}
                {!photos.length && <p className="text-slate-500 col-span-3">No hay fotografías cargadas todavía.</p>}
              </div>
            </TabsContent>
            <TabsContent value="videos" className="mt-6">
              <div className="space-y-8">
                {videoGroups.map((group) => (
                  <div key={group.id}>
                    {group.title && <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">{group.title}</h3>}
                    <div className="grid gap-4 md:grid-cols-2">
                      {group.items.map((m) => (
                        <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-6 transition-colors hover:border-emerald-300">
                          <Video className="mb-2 h-6 w-6 text-emerald-700" />
                          <div className="font-display font-semibold">{m.title}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                {!videos.length && <p className="text-slate-500">No hay videos cargados.</p>}
              </div>
            </TabsContent>
            <TabsContent value="informes" className="mt-6">
              <div className="space-y-3">
                {(project.reports || []).map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors" data-testid={`report-${r.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                      <div>
                        <div className="font-display font-semibold text-slate-900">{r.title}</div>
                        {r.size && <div className="text-xs text-slate-500 font-mono-accent">{(r.size/1024/1024).toFixed(2)} MB · PDF</div>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full"><Download className="w-4 h-4 mr-1" /> Descargar</Button>
                  </a>
                ))}
                {!(project.reports || []).length && <p className="text-slate-500">No hay informes disponibles.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Milestones */}
        {(project.milestones || []).length > 0 && (
          <section>
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Hitos</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">L�nea de tiempo de hitos</h2>
            <div className="space-y-3">
              {(project.milestones || []).map((m) => (
                <div key={m.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white" data-testid={`milestone-${m.id}`}>
                  {m.achieved ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-semibold text-slate-900">{m.title}</span>
                      <span className="text-xs font-mono-accent text-slate-500">{m.date}</span>
                    </div>
                    {m.description && <p className="text-sm text-slate-600 mt-0.5">{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seguimientos */}
        {(project.seguimientos || []).length > 0 && (
          <section id="seguimiento" className="scroll-mt-24">
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Bit�cora</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6">Seguimiento del proyecto</h2>
            <div className="space-y-3">
              {[...(project.seguimientos || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((s) => (
                <div key={s.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white" data-testid={`seguimiento-${s.id}`}>
                  <span className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0" style={seguimientoStyle(s.status)} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display font-semibold text-slate-900">{s.title}</span>
                      <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={seguimientoStyle(s.status)}>{s.status}</span>
                      {s.date && <span className="text-xs font-mono-accent text-slate-500">{s.date}</span>}
                    </div>
                    {s.description && <p className="text-sm text-slate-600 mt-1">{s.description}</p>}
                    {s.responsible && <p className="text-xs text-slate-400 mt-1">Responsable: {s.responsible}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
