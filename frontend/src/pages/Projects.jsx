import { useEffect, useState } from "react";
import { api, CATEGORIES } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ProjectCard } from "./Landing";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
  }, []);

  const filtered = projects.filter((p) => {
    if (cat !== "Todos" && p.category !== cat) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase()) && !p.tagline.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-2 text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold">Iniciativas</div>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">Todas las iniciativas documentadas</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">Explora los proyectos con sus indicadores, mapas, historias de vida e informes descargables.</p>

      <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar iniciativa..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 rounded-full"
            data-testid="projects-search"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todos", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              data-testid={`filter-${c.toLowerCase()}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === c ? "bg-emerald-700 text-white" : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="mt-8 mb-4 text-sm text-slate-500">
        <Badge variant="outline" className="rounded-full font-mono-accent">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
