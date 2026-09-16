export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/images/image.png" alt="Transformando territorios" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
            Plataforma para mostrar de forma clara y visual los resultados de iniciativas sociales.
            Pensada para convocatorias, premios y procesos de financiación.
          </p>
        </div>
        <div>
          <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-3">Secciones</div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Iniciativas activas</li>
            <li>Historias de vida</li>
            <li>Vista para evaluadores</li>
            <li>Informes descargables</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-mono-accent uppercase tracking-widest text-emerald-700 font-semibold mb-3">Contacto</div>
          <p className="text-sm text-slate-600">admin@transformandoterritorios.org</p>
          <p className="text-xs text-slate-500 mt-6">© {new Date().getFullYear()} — Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
