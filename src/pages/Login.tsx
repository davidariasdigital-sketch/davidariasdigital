import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciales incorrectas");
      setLoading(false);
    } else {
      navigate("/style-guide");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="blob w-[400px] h-[400px] bg-primary/15 top-1/3 left-1/4 float-slower" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm liquid-glass rounded-[var(--radius)] p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Acceso privado</h1>
          <p className="text-muted-foreground text-sm mt-2">Solo para administradores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-3 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft size={14} /> Volver al sitio
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
