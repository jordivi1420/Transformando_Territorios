import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Sesión iniciada");
      nav("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Credenciales inválidas");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 hero-radial grain-bg">
      <Card className="w-full max-w-md p-8">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center mb-5">
          <LogIn className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Acceso administradores</h1>
        <p className="mt-2 text-sm text-slate-600">Ingresa para gestionar iniciativas, indicadores y evidencias.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Usuario o correo</Label>
            <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" className="mt-1.5" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-emerald-700 hover:bg-emerald-800 h-11" data-testid="login-submit">
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-500 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="font-semibold text-slate-700 mb-1">Credenciales:</div>
          Usuario: admin<br />Contrase�a: admin123
        </div>
      </Card>
    </div>
  );
}
