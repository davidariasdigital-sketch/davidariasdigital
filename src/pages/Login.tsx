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
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(0 0% 97%) 0%, hsl(0 0% 93%) 50%, hsl(48 30% 93%) 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-[hsl(48,100%,50%)]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] rounded-full bg-[hsl(48,100%,50%)]/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[hsl(0,0%,90%)] p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(48,100%,50%)]/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-[hsl(48,100%,42%)]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(0,0%,10%)]">Acceso privado</h1>
          <p className="text-[hsl(0,0%,45%)] text-sm mt-2">Solo para administradores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-[hsl(0,0%,45%)] uppercase tracking-wider block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[hsl(0,0%,97%)] border border-[hsl(0,0%,88%)] rounded-xl px-4 py-3 text-[hsl(0,0%,10%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(48,100%,50%)]/50 focus:border-[hsl(48,100%,50%)] transition-all placeholder:text-[hsl(0,0%,60%)]"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[hsl(0,0%,45%)] uppercase tracking-wider block mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[hsl(0,0%,97%)] border border-[hsl(0,0%,88%)] rounded-xl px-4 py-3 text-[hsl(0,0%,10%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(48,100%,50%)]/50 focus:border-[hsl(48,100%,50%)] transition-all placeholder:text-[hsl(0,0%,60%)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[hsl(0,84%,60%)] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[hsl(48,100%,50%)] text-[hsl(0,0%,8%)] font-bold text-sm py-3.5 rounded-full hover:brightness-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-[hsl(0,0%,45%)] text-sm hover:text-[hsl(0,0%,20%)] transition-colors mx-auto"
        >
          <ArrowLeft size={14} /> Volver al sitio
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
