import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function Stories() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    api.get("/projects?active_only=true").then((r) => {
      const all = r.data.flatMap((p) => (p.life_stories || []).map((s) => ({ ...s, project: p })));
      setStories(all);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-2 text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold">Historias de vida</div>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">Voces de las personas impactadas</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">Testimonios reales de beneficiarios y líderes comunitarios que dan sentido a los indicadores.</p>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((s) => (
          <Card key={s.id} className="overflow-hidden group" data-testid={`story-card-${s.id}`}>
            {s.photo_url && (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.photo_url} alt={s.beneficiary_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-5">
              <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">{s.project.category}</div>
              <Quote className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="italic text-slate-800 leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="font-display font-semibold text-slate-900">{s.beneficiary_name}{s.age ? `, ${s.age}` : ""}</div>
                <div className="text-xs text-slate-500">{s.community} · {s.project.title}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
