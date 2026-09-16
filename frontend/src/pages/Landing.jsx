import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MapView from "@/components/MapView";
import { ArrowUpRight, Target, TrendingUp, Users, Sparkles, MapPin, Layers, Award, ClipboardList } from "lucide-react";

export default function Landing() {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allPoints, setAllPoints] = useState([]);

  useEffect(() => {
    api.get("/projects/summary").then((r) => setSummary(r.data));
    api.get("/projects?active_only=true").then((r) => {
      setProjects(r.data);
      const pts = r.data.flatMap((p) => p.map_points || []);
      setAllPoints(pts);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-radial grain-bg pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 fade-up">
              <Badge variant="outline" className="mb-6 rounded-full font-mono-accent uppercase text-xs tracking-widest text-emerald-700 border-emerald-200 bg-emerald-50">
                <Sparkles className="w-3 h-3 mr-1" /> Convocatorias · Premios · Financiación
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900">
                Evidencia de impacto <span className="text-emerald-700">clara y visual</span>, en un solo lugar.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Muestra indicadores, mapas, historias de vida, fotografías, videos e informes de tu iniciativa
                para que cualquier evaluador entienda su alcance, innovación, escalabilidad y beneficios en minutos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/proyectos">
                  <Button size="lg" className="rounded-full bg-emerald-700 hover:bg-emerald-800 h-12 px-6" data-testid="hero-view-projects">
                    Ver iniciativas <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/evaluacion">
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-6" data-testid="hero-evaluator-view">
                    <Award className="w-4 h-4 mr-1" /> Vista para evaluadores
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metrics card */}
            <div className="lg:col-span-5 fade-up" style={{ animationDelay: "0.15s" }}>
              <Card className="p-6 bg-white/90 backdrop-blur-xl border-slate-200 shadow-lg">
                <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-4">
                  Impacto agregado en tiempo real
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MetricStat icon={<Users className="w-4 h-4" />} label="Personas beneficiadas" value={summary?.total_beneficiaries?.toLocaleString() || "�"} />
                  <MetricStat icon={<Target className="w-4 h-4" />} label="Proyectos activos" value={summary?.total_projects || "�"} />
                  <MetricStat icon={<TrendingUp className="w-4 h-4" />} label="Metas alcanzadas" value={summary ? `${summary.completion_rate}%` : "�"} highlight />
                  <MetricStat icon={<Layers className="w-4 h-4" />} label="Sectores" value={summary ? Object.keys(summary.by_category || {}).length : "�"} />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progreso global (logros vs metas)</span>
                    <span className="font-mono-accent text-slate-900">{summary?.completion_rate || 0}%</span>
                  </div>
                  <Progress value={summary?.completion_rate || 0} className="h-2" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Global map */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">
                <MapPin className="w-3 h-3 inline mr-1" /> Presencia territorial
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Dónde estamos trabajando</h2>
              <p className="mt-2 text-slate-600 max-w-2xl text-base">Cada punto es una intervención documentada con fotografías, testimonios e indicadores medibles.</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono-accent uppercase text-xs">
              {allPoints.length} puntos de intervención
            </Badge>
          </div>
          <MapView points={allPoints} height={500} />
        </div>
      </section>

      {/* Projects grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Iniciativas</div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Proyectos con evidencia verificable</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricStat({ icon, label, value, highlight }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">{icon} {label}</div>
      <div className={`font-display font-extrabold text-2xl ${highlight ? "text-emerald-800" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

export function ProjectCard({ project }) {
  const navigate = useNavigate();
  const target = (project.indicators || []).reduce((s, i) => s + (i.target || 0), 0);
  const achieved = (project.indicators || []).reduce((s, i) => s + (i.achieved || 0), 0);
  const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
  const activeSeguimiento = (project.seguimientos || []).find((s) => {
    const st = (s.status || "").toLowerCase();
    return st.includes("activ") || st.includes("curso");
  });

  return (
    <div
      onClick={() => navigate(`/proyectos/${project.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/proyectos/${project.slug}`); }}
      data-testid={`project-card-${project.slug}`}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
        <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
          {project.cover_image && (
            <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/95 text-slate-800 border-0 rounded-full font-mono-accent uppercase text-xs">{project.category}</Badge>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-display font-bold text-xl leading-tight text-slate-900">{project.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{project.tagline}</p>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Avance metas</span>
              <span className="font-mono-accent font-semibold text-emerald-800">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
          {activeSeguimiento && (
            <Link
              to={`/proyectos/${project.slug}#seguimiento`}
              onClick={(e) => e.stopPropagation()}
              data-testid={`project-card-seguimiento-${project.slug}`}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 w-fit text-white"
              style={{ background: "var(--confianza-horizonte)" }}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Seguimiento activo
            </Link>
          )}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.location_name}</span>
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">Ver detalle <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
