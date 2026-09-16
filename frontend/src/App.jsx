import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import EvaluatorView from "@/pages/EvaluatorView";
import Stories from "@/pages/Stories";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import "@/App.css";

function Layout() {
  const location = useLocation();
  const isLogin = location.pathname === "/admin/login";
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      {!isLogin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/proyectos" element={<Projects />} />
            <Route path="/proyectos/:slug" element={<ProjectDetail />} />
            <Route path="/evaluacion" element={<EvaluatorView />} />
            <Route path="/historias" element={<Stories />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
