import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/api";
import { Plus, Edit, Trash2, ExternalLink, LayoutDashboard, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import ProjectEditor from "@/components/ProjectEditor";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!loading && !user) nav("/admin/login");
  }, [user, loading, nav]);

  const load = () => {
    api.get("/projects").then((r) => setProjects(r.data));
    api.get("/projects/summary").then((r) => setSummary(r.data));
  };
  useEffect(load, []);

  const handleCreate = async (data) => {
    try {
      await api.post("/projects", data);
      toast.success("Iniciativa creada");
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear");
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("¿Eliminar esta iniciativa? Esta acción no se puede deshacer.")) return;
    await api.delete(`/projects/${slug}`);
    toast.success("Iniciativa eliminada");
    load();
  };

  if (!user) return null;

  if (editing) {
    return <ProjectEditor slug={editing} onBack={() => { setEditing(null); load(); }} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-2">
            <LayoutDashboard className="w-3 h-3 inline mr-1" /> Panel de administración
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Gestión de iniciativas</h1>
          <p className="mt-2 text-slate-600">Hola, {user.name}. Aquí puedes crear, editar y hacer seguimiento a los proyectos.</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid="create-project-btn">
              <Plus className="w-4 h-4 mr-1" /> Nueva iniciativa
            </Button>
          </DialogTrigger>
          <CreateProjectDialog onSubmit={handleCreate} />
        </Dialog>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Iniciativas activas" value={summary.total_projects} />
          <StatCard label="Beneficiarios" value={summary.total_beneficiaries.toLocaleString()} />
          <StatCard label="Metas alcanzadas" value={`${summary.completion_rate}%`} highlight />
          <StatCard label="Sectores" value={Object.keys(summary.by_category || {}).length} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => {
          const target = (p.indicators || []).reduce((s, i) => s + (i.target || 0), 0);
          const achieved = (p.indicators || []).reduce((s, i) => s + (i.achieved || 0), 0);
          const pct = target ? Math.round((achieved/target)*100) : 0;
          return (
            <Card key={p.id} className="p-5" data-testid={`admin-project-${p.slug}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className="bg-slate-100 text-slate-700 rounded-full font-mono-accent uppercase text-xs border-0">{p.category}</Badge>
                  <h3 className="mt-2 font-display font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{p.tagline}</p>
                </div>
                {p.active ? <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 rounded-full text-xs">Activo</Badge> : <Badge variant="outline" className="rounded-full text-xs">Inactivo</Badge>}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Avance</span><span className="font-mono-accent font-semibold">{pct}%</span></div>
                <Progress value={pct} className="h-1.5" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-center">
                <div className="p-2 rounded bg-slate-50"><div className="text-slate-500">Indicadores</div><div className="font-bold text-slate-900 font-display text-sm">{p.indicators?.length || 0}</div></div>
                <div className="p-2 rounded bg-slate-50"><div className="text-slate-500">Historias</div><div className="font-bold text-slate-900 font-display text-sm">{p.life_stories?.length || 0}</div></div>
                <div className="p-2 rounded bg-slate-50"><div className="text-slate-500">Puntos</div><div className="font-bold text-slate-900 font-display text-sm">{p.map_points?.length || 0}</div></div>
                <div className="p-2 rounded bg-slate-50"><div className="text-slate-500">Seguimientos</div><div className="font-bold text-slate-900 font-display text-sm">{p.seguimientos?.length || 0}</div></div>
              </div>
              <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setEditing(p.slug)} data-testid={`edit-${p.slug}`} className="rounded-full flex-1"><Edit className="w-3 h-3 mr-1" /> Editar</Button>
                <Link to={`/proyectos/${p.slug}`} target="_blank" className="flex-1"><Button size="sm" variant="outline" className="rounded-full w-full"><ExternalLink className="w-3 h-3 mr-1" /> Ver</Button></Link>
                <Button size="sm" variant="outline" onClick={() => handleDelete(p.slug)} data-testid={`delete-${p.slug}`} className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <Card className={`p-5 ${highlight ? "bg-emerald-50 border-emerald-200" : ""}`}>
      <div className="text-xs text-slate-500 font-mono-accent uppercase tracking-wider">{label}</div>
      <div className={`mt-2 font-display font-extrabold text-3xl ${highlight ? "text-emerald-800" : "text-slate-900"}`}>{value}</div>
    </Card>
  );
}

function CreateProjectDialog({ onSubmit }) {
  const [customCategories, setCustomCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("transformando_categorias_personalizadas_v2") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ slug: "", title: "", tagline: "", category: "Agua", customCategory: "", description: "", location_name: "", cover_image: "" });
  const set = (k, v) => setForm((current) => ({ ...current, [k]: v }));
  const selectedCategory = form.category === "Otro" ? form.customCategory.trim() : form.category;

  const submit = () => {
    if (form.category === "Otro" && !selectedCategory) {
      toast.error("Escribe el nombre de la nueva categor�a");
      return;
    }
    if (form.category === "Otro" && !customCategories.includes(selectedCategory)) {
      const nextCategories = [...customCategories, selectedCategory];
      localStorage.setItem("transformando_categorias_personalizadas_v2", JSON.stringify(nextCategories));
      setCustomCategories(nextCategories);
    }
    const { customCategory, ...project } = form;
    onSubmit({ ...project, category: selectedCategory });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> Nueva iniciativa</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div><Label>Título</Label><Input value={form.title} onChange={(e) => { const title = e.target.value; setForm((current) => ({ ...current, title, slug: current.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} data-testid="new-title" /></div>
        <div><Label>Identificador de URL</Label><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} data-testid="new-slug" /></div>
        <div><Label>Resumen breve</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} data-testid="new-tagline" /></div>
        <div>
          <Label>Categoría</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger data-testid="new-category"><SelectValue /></SelectTrigger>
            <SelectContent>{[...CATEGORIES, ...customCategories.filter((c) => !CATEGORIES.includes(c))].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {form.category === "Otro" && (
          <div>
            <Label>Nombre de la nueva categoría</Label>
            <Input value={form.customCategory} onChange={(e) => set("customCategory", e.target.value)} data-testid="new-custom-category" />
            <p className="mt-1 text-xs text-slate-500">Se guardará para poder usarla en futuras iniciativas.</p>
          </div>
        )}
        <div><Label>Ubicación</Label><Input value={form.location_name} onChange={(e) => set("location_name", e.target.value)} data-testid="new-location" /></div>
        <div>
          <Label>Imagen de portada</Label>
          <CoverImagePicker value={form.cover_image} onUploaded={(url) => set("cover_image", url)} />
        </div>
        <div><Label>Descripción</Label><Textarea rows={4} placeholder="Explica que hace la iniciativa, a quien beneficia y cual es su impacto." value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="new-description" /></div>
      </div>
      <DialogFooter>
        <Button onClick={submit} className="rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid="new-submit">Crear iniciativa</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CoverImagePicker({ value, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const selectImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await api.post("/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      onUploaded(response.data.url);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mt-1.5 space-y-2">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} className="hidden" data-testid="new-cover-file" />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-full" data-testid="new-cover-upload">
          <Upload className="w-4 h-4 mr-2" /> {uploading ? "Subiendo..." : "Seleccionar imagen"}
        </Button>
        {value && <span className="text-xs text-slate-600 inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Imagen lista</span>}
      </div>
      {value && <img src={value} alt="Vista previa de portada" className="h-20 w-32 rounded-lg object-cover border border-sand" />}
    </div>
  );
}

