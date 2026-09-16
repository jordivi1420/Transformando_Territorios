import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Upload, MapPin, Target, MessageSquareQuote, FileText, Image as ImageIcon, ClipboardList } from "lucide-react";

export default function ProjectEditor({ slug, onBack }) {
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get(`/projects/${slug}`).then((r) => setProject(r.data)); }, [slug]);

  const save = async (patch) => {
    setSaving(true);
    try {
      const r = await api.patch(`/projects/${slug}`, patch);
      setProject(r.data);
      toast.success("Cambios guardados");
    } catch (e) {
      toast.error("Error al guardar");
    } finally { setSaving(false); }
  };

  const update = (key, val) => setProject((p) => ({ ...p, [key]: val }));

  if (!project) return <div className="max-w-7xl mx-auto p-8">Cargando⬦</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={onBack} className="text-sm text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-1" data-testid="editor-back">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </button>

      {/* Basics */}
      <Card className="p-6 mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-4">Información general</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Título</Label><Input value={project.title} onChange={(e) => update("title", e.target.value)} data-testid="edit-title" /></div>
          <div><Label>Tagline</Label><Input value={project.tagline} onChange={(e) => update("tagline", e.target.value)} data-testid="edit-tagline" /></div>
          <div><Label>Ubicación</Label><Input value={project.location_name || ""} onChange={(e) => update("location_name", e.target.value)} /></div>
          <div><Label>Presupuesto (USD)</Label><Input type="number" value={project.budget || 0} onChange={(e) => update("budget", parseFloat(e.target.value))} /></div>
          <div className="md:col-span-2">
            <Label>Imagen de portada</Label>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <UploadButton accept="image/png,image/jpeg,image/webp" onUploaded={(url) => update("cover_image", url)} />
              {project.cover_image && <img src={project.cover_image} alt="Vista previa de portada" className="h-16 w-28 rounded-lg object-cover border border-sand" />}
            </div>
          </div>
          <div className="md:col-span-2"><Label>Descripción</Label><Textarea rows={4} value={project.description} onChange={(e) => update("description", e.target.value)} /></div>
        </div>
        <p className="mt-5 text-sm text-slate-600">Asigna una puntuación de 0 a 100 a cada dimensión. Usa una puntuación alta cuando la iniciativa tenga resultados y evidencias sólidas.</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {["reach_score", "innovation_score", "scalability_score", "benefits_score"].map((k) => (
            <div key={k}>
              <Label className="capitalize">{{reach_score: "Alcance", innovation_score: "Innovación", scalability_score: "Escalabilidad", benefits_score: "Beneficios"}[k]}</Label>
              <p className="mt-1 min-h-10 text-xs text-slate-500">{{reach_score: "A cuántas personas o comunidades llega.", innovation_score: "Qué tan nueva o diferente es la solución.", scalability_score: "Qué tan fácil es replicarla o ampliarla.", benefits_score: "Qué tan importantes son los beneficios logrados."}[k]}</p>
              <Input type="number" min="0" max="100" value={project[k] || 0} onChange={(e) => update(k, parseInt(e.target.value) || 0)} placeholder="0 a 100" />
            </div>
          ))}
        </div>
        <Button onClick={() => save(project)} disabled={saving} className="mt-5 rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid="save-basics"><Save className="w-4 h-4 mr-1" /> Guardar cambios</Button>
      </Card>

      <Tabs defaultValue="indicators">
        <TabsList>
          <TabsTrigger value="indicators" data-testid="tab-edit-indicators"><Target className="w-4 h-4 mr-1" /> Indicadores</TabsTrigger>
          <TabsTrigger value="map" data-testid="tab-edit-map"><MapPin className="w-4 h-4 mr-1" /> Ubicaciones</TabsTrigger>
          <TabsTrigger value="stories" data-testid="tab-edit-stories"><MessageSquareQuote className="w-4 h-4 mr-1" /> Historias</TabsTrigger>
          <TabsTrigger value="media" data-testid="tab-edit-media"><ImageIcon className="w-4 h-4 mr-1" /> Multimedia</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-edit-reports"><FileText className="w-4 h-4 mr-1" /> Informes</TabsTrigger>
          <TabsTrigger value="seguimientos" data-testid="tab-edit-seguimientos"><ClipboardList className="w-4 h-4 mr-1" /> Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="mt-6">
          <ListEditor
            items={project.indicators || []}
            onChange={(list) => save({ indicators: list })}
            fields={[
              { key: "name", label: "Nombre" },
              { key: "unit", label: "Unidad" },
              { key: "target", label: "Meta", type: "number" },
              { key: "achieved", label: "Logrado", type: "number" },
              { key: "category", label: "Categoría" },
            ]}
            newItem={{ name: "", unit: "", target: 0, achieved: 0, category: "" }}
            testIdPrefix="indicator"
          />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <ListEditor
            items={project.map_points || []}
            onChange={(list) => save({ map_points: list })}
            fields={[
              { key: "label", label: "Etiqueta" },
              { key: "lat", label: "Latitud", type: "number", step: "0.0001" },
              { key: "lng", label: "Longitud", type: "number", step: "0.0001" },
              { key: "status", label: "Estado (activo/planeado)" },
              { key: "description", label: "Descripción" },
            ]}
            newItem={{ label: "", lat: 4.6, lng: -74.08, status: "activo", description: "" }}
            testIdPrefix="mappoint"
          />
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <ListEditor
            items={project.life_stories || []}
            onChange={(list) => save({ life_stories: list })}
            fields={[
              { key: "beneficiary_name", label: "Nombre" },
              { key: "age", label: "Edad", type: "number" },
              { key: "community", label: "Comunidad" },
              { key: "quote", label: "Testimonio", multiline: true },
              { key: "impact", label: "Impacto" },
              { key: "photo_url", label: "Foto (URL)", upload: true },
            ]}
            newItem={{ beneficiary_name: "", age: 0, community: "", quote: "", impact: "", photo_url: "" }}
            testIdPrefix="story"
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaEditor
            items={project.media || []}
            onChange={(list) => save({ media: list })}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ListEditor
            items={project.reports || []}
            onChange={(list) => save({ reports: list })}
            fields={[
              { key: "title", label: "Título" },
              { key: "url", label: "URL / archivo", upload: true, accept: "application/pdf" },
              { key: "size", label: "Tamaño (bytes)", type: "number" },
            ]}
            newItem={{ kind: "documento", title: "", url: "", size: 0, content_type: "application/pdf" }}
            testIdPrefix="report"
          />
        </TabsContent>

        <TabsContent value="seguimientos" className="mt-6">
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-2">Hitos del proyecto</h3>
              <p className="mb-3 text-sm text-slate-600">A�ade varios hitos o entregables del proyecto. Puedes marcar si ya est�n completados y editarlos en cualquier momento.</p>
              <ListEditor
                items={project.milestones || []}
                onChange={(list) => save({ milestones: list })}
                fields={[
                  { key: "title", label: "T�tulo" },
                  { key: "date", label: "Fecha", type: "text" },
                  { key: "description", label: "Descripci�n", multiline: true },
                  { key: "achieved", label: "Completado", type: "checkbox" },
                ]}
                newItem={{ title: "", date: "", description: "", achieved: false }}
                testIdPrefix="milestone"
              />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-2">Bit�cora de seguimiento</h3>
              <p className="mb-3 text-sm text-slate-600">Registra la bit�cora de seguimiento del proyecto. Usa el estado "Activo" o "En curso" para que aparezca como seguimiento vigente en la vista p�blica.</p>
              <ListEditor
                items={project.seguimientos || []}
                onChange={(list) => save({ seguimientos: list })}
                fields={[
                  { key: "title", label: "T�tulo" },
                  { key: "status", label: "Estado (Activo/En curso/Completado/Atrasado/Pendiente)" },
                  { key: "date", label: "Fecha", type: "date" },
                  { key: "description", label: "Descripci�n", multiline: true },
                  { key: "responsible", label: "Responsable" },
                ]}
                newItem={{ title: "", status: "Activo", date: "", description: "", responsible: "" }}
                testIdPrefix="seguimiento"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MediaEditor({ items, onChange }) {
  const [local, setLocal] = useState(items);
  const [busy, setBusy] = useState(false);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const albumRef = useRef(null);

  useEffect(() => setLocal(items), [items]);

  const update = (idx, key, value) => {
    const next = [...local];
    next[idx] = { ...next[idx], [key]: value };
    setLocal(next);
  };

  const addEmpty = () => setLocal([...local, { id: crypto.randomUUID(), kind: "foto", title: "", url: "" }]);
  const remove = (idx) => setLocal(local.filter((_, index) => index !== idx));
  const updateGroupTitle = (groupId, title) => setLocal(local.map((item) => item.group_id === groupId ? { ...item, group_title: title } : item));

  const uploadFiles = async (event, mode) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const isAlbum = mode === "album";
    setBusy(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      const uploaded = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        return { file, url: `${backendUrl}${response.data.url}` };
      }));
      const folderTitle = isAlbum ? files[0].webkitRelativePath.split("/")[0] : "";
      const groupId = isAlbum ? crypto.randomUUID() : undefined;
      const coverIndex = isAlbum ? Math.floor(Math.random() * uploaded.filter(({ file }) => file.type.startsWith("image/")).length) : -1;
      let imageIndex = 0;
      const additions = uploaded.map(({ file, url }) => ({
        id: crypto.randomUUID(),
        kind: mode === "video" ? "video" : "foto",
        title: isAlbum ? folderTitle : file.name.replace(/\.[^.]+$/, ""),
        url,
        ...(isAlbum ? { group_id: groupId, group_title: folderTitle, album: true, is_cover: file.type.startsWith("image/") && imageIndex++ === coverIndex } : {}),
      }));
      setLocal((current) => [...current, ...additions]);
      toast.success(isAlbum ? `${additions.length} archivos a�adidos al �lbum` : `${mode === "video" ? "Video" : "Foto"} a�adida`);
    } catch (error) {
      toast.error("No se pudieron subir todos los archivos");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const groups = local.reduce((result, item, index) => {
    const key = item.group_id || `single-${index}`;
    if (!result[key]) result[key] = { title: item.group_title || "Im�genes individuales", items: [] };
    result[key].items.push({ item, index });
    return result;
  }, {});

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        <Button variant="outline" onClick={addEmpty} className="rounded-full" data-testid="media-add"><Plus className="w-4 h-4 mr-1" /> A�adir imagen</Button>
        <Button variant="outline" onClick={() => photoRef.current?.click()} disabled={busy} className="rounded-full"><Upload className="w-4 h-4 mr-1" /> Subir foto</Button>
        <Button variant="outline" onClick={() => videoRef.current?.click()} disabled={busy} className="rounded-full"><Upload className="w-4 h-4 mr-1" /> Subir video</Button>
        <Button variant="outline" onClick={() => albumRef.current?.click()} disabled={busy} className="rounded-full"><Upload className="w-4 h-4 mr-1" /> Subir �lbum</Button>
        <input ref={photoRef} type="file" accept="image/*" onChange={(event) => uploadFiles(event, "photo")} className="hidden" />
        <input ref={videoRef} type="file" accept="video/*" onChange={(event) => uploadFiles(event, "video")} className="hidden" />
        <input ref={albumRef} type="file" accept="image/*,video/*" multiple webkitdirectory="true" directory="true" onChange={(event) => uploadFiles(event, "album")} className="hidden" />
      </div>
      {busy && <p className="mb-4 text-sm text-slate-500">Subiendo archivos...</p>}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupId, group]) => (
          <div key={groupId} className="space-y-3">
            {groupId.startsWith("single-") ? (
              <h3 className="font-display font-semibold text-slate-900">{group.title}</h3>
            ) : (
              <div className="max-w-md"><Label className="text-xs">T�tulo de la carpeta</Label><Input value={group.title} onChange={(event) => updateGroupTitle(groupId, event.target.value)} /></div>
            )}
            {group.items.map(({ item, index }) => (
              <div key={item.id || index} className="relative grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2" data-testid={`media-item-${index}`}>
                <div><Label className="text-xs">Tipo (foto/video)</Label><Input value={item.kind || "foto"} onChange={(event) => update(index, "kind", event.target.value)} /></div>
                <div><Label className="text-xs">T�tulo</Label><Input value={item.title || ""} onChange={(event) => update(index, "title", event.target.value)} /></div>
                <div className="md:col-span-2"><Label className="text-xs">URL</Label><Input value={item.url || ""} onChange={(event) => update(index, "url", event.target.value)} /></div>
                <Button variant="ghost" size="sm" onClick={() => remove(index)} className="absolute right-2 top-2 text-rose-600 hover:bg-rose-50" data-testid={`media-remove-${index}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        ))}
        {!local.length && <p className="text-sm text-slate-500">Todav�a no hay im�genes o videos cargados.</p>}
      </div>
      <Button onClick={() => onChange(local)} disabled={busy} className="mt-6 rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid="media-save"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
    </Card>
  );
}

function ListEditor({ items, onChange, fields, newItem, testIdPrefix }) {
  const [local, setLocal] = useState(items);
  useEffect(() => setLocal(items), [items]);

  const update = (idx, key, val) => {
    const next = [...local];
    next[idx] = { ...next[idx], [key]: val };
    setLocal(next);
  };
  const remove = (idx) => setLocal(local.filter((_, i) => i !== idx));
  const add = () => setLocal([...local, { ...newItem, id: crypto.randomUUID() }]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {local.map((item, idx) => (
          <div key={item.id || idx} className="p-4 rounded-xl border border-slate-200 grid md:grid-cols-2 gap-3 relative" data-testid={`${testIdPrefix}-item-${idx}`}>
            {fields.map((f) => (
              <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                <Label className="text-xs">{f.label}</Label>
                {f.type === "checkbox" ? (
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(item[f.key])}
                      onChange={(e) => update(idx, f.key, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    {item[f.key] ? "Completado" : "Pendiente"}
                  </label>
                ) : f.multiline ? (
                  <Textarea rows={3} value={item[f.key] || ""} onChange={(e) => update(idx, f.key, e.target.value)} />
                ) : f.upload ? (
                  <div className="flex gap-2">
                    <Input value={item[f.key] || ""} onChange={(e) => update(idx, f.key, e.target.value)} placeholder="URL o subir archivo" />
                    <UploadButton accept={f.accept} onUploaded={(u) => update(idx, f.key, u)} />
                  </div>
                ) : (
                  <Input type={f.type || "text"} step={f.step} value={item[f.key] ?? ""} onChange={(e) => update(idx, f.key, f.type === "number" ? parseFloat(e.target.value) : e.target.value)} />
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => remove(idx)} className="absolute top-2 right-2 text-rose-600 hover:bg-rose-50" data-testid={`${testIdPrefix}-remove-${idx}`}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={add} className="rounded-full" data-testid={`${testIdPrefix}-add`}><Plus className="w-4 h-4 mr-1" /> Añadir</Button>
        <Button onClick={() => onChange(local)} className="rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid={`${testIdPrefix}-save`}><Save className="w-4 h-4 mr-1" /> Guardar</Button>
      </div>
    </Card>
  );
}

function UploadButton({ accept, onUploaded }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
      onUploaded(`${backendUrl}${r.data.url}`);
      toast.success("Archivo subido");
    } catch (err) {
      toast.error("Error al subir");
    } finally { setBusy(false); e.target.value = ""; }
  };
  return (
    <>
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy} className="rounded-full flex-shrink-0"><Upload className="w-3 h-3 mr-1" />{busy ? "⬦" : "Subir"}</Button>
    </>
  );
}
