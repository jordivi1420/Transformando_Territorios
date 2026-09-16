import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Sparkles, Users } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";

const COLORS = ["#047857", "#0284C7", "#D97706", "#8B5CF6", "#EC4899"];

export default function EvaluatorView() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api.get("/projects?active_only=true").then((r) => {
      setProjects(r.data);
      setSelected(r.data.slice(0, 3).map((p) => p.slug));
    });
  }, []);

  const toggle = (slug) => {
    setSelected((s) => s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug].slice(-4));
  };

  const selectedProjects = projects.filter((p) => selected.includes(p.slug));

  const radarData = ["Alcance", "Innovación", "Escalabilidad", "Beneficios"].map((dim) => {
    const row = { dim };
    selectedProjects.forEach((p) => {
      const key = { "Alcance": "reach_score", "Innovación": "innovation_score", "Escalabilidad": "scalability_score", "Beneficios": "benefits_score" }[dim];
      row[p.title] = p[key] || 0;
    });
    return row;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-2 text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold">
        <Award className="w-3 h-3 inline mr-1" /> Vista para evaluadores
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">Compara iniciativas lado a lado</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">Dimensiones clave para convocatorias, premios y decisiones de financiación: alcance, innovación, escalabilidad y beneficios generados.</p>

      {/* Selector */}
      <section className="mt-8">
        <div className="text-xs font-mono-accent uppercase tracking-widest text-slate-500 mb-3">Selecciona hasta 4 iniciativas</div>
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.slug}
              onClick={() => toggle(p.slug)}
              data-testid={`compare-toggle-${p.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selected.includes(p.slug)
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300"
              }`}
            >{p.title}</button>
          ))}
        </div>
      </section>

      {/* Radar */}
      <Card className="mt-8 p-6">
        <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">Matriz comparativa</div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-4">Puntaje por dimensión (0-100)</h2>
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="dim" tick={{ fill: "#0F172A", fontSize: 13, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
            {selectedProjects.map((p, i) => (
              <Radar key={p.slug} name={p.title} dataKey={p.title} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
            ))}
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detail cards */}
      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        {selectedProjects.map((p, i) => {
          const target = (p.indicators || []).reduce((s, x) => s + x.target, 0);
          const achieved = (p.indicators || []).reduce((s, x) => s + x.achieved, 0);
          const pct = target ? Math.round((achieved / target) * 100) : 0;
          return (
            <Card key={p.slug} className="p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: COLORS[i] }} />
              <div className="pl-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="bg-slate-100 text-slate-700 border-0 rounded-full font-mono-accent uppercase text-xs">{p.category}</Badge>
                    <h3 className="mt-2 font-display font-bold text-xl">{p.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{p.tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-display font-extrabold text-emerald-800">{pct}%</div>
                    <div className="text-xs text-slate-500 font-mono-accent">avance</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 text-center">
                  <MiniScore label="Alcance" value={p.reach_score} icon={<Users className="w-3 h-3" />} />
                  <MiniScore label="Innovación" value={p.innovation_score} icon={<Sparkles className="w-3 h-3" />} />
                  <MiniScore label="Escala" value={p.scalability_score} icon={<TrendingUp className="w-3 h-3" />} />
                  <MiniScore label="Beneficio" value={p.benefits_score} icon={<Award className="w-3 h-3" />} />
                </div>
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{p.location_name}</span>
                  <Link to={`/proyectos/${p.slug}`}>
                    <Button variant="outline" size="sm" className="rounded-full" data-testid={`compare-view-${p.slug}`}>Ver evidencia completa</Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function MiniScore({ label, value, icon }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
      <div className="text-xs text-slate-500 flex items-center justify-center gap-1">{icon}{label}</div>
      <div className="mt-1 font-display font-bold text-lg text-slate-900">{value || 0}</div>
    </div>
  );
}
