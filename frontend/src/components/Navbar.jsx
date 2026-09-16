import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/proyectos", label: "Iniciativas" },
    { to: "/evaluacion", label: "Evaluación" },
    { to: "/historias", label: "Historias" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <img src="/images/image.png" alt="Transformando territorios" className="h-10 w-auto object-contain" />
          <div className="font-display font-extrabold text-lg leading-none text-[#4A2412]">
            Transformando <span className="text-[#C75A3B]">territorios</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = location.pathname === l.to || (l.to !== "/" && location.pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="nav-user-menu" className="rounded-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {user.name?.split(" ")[0] || "Admin"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/admin" data-testid="nav-admin-dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Panel de administración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="nav-logout">
                  <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/admin/login">
              <Button className="rounded-full bg-emerald-700 hover:bg-emerald-800" data-testid="nav-login-btn">
                Acceso Admin
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="nav-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navLinks.map((l) => (
                <DropdownMenuItem asChild key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
