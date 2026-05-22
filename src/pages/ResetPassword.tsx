import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase places the recovery session in the URL hash; the client picks it up automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Mínimo 6 caracteres");
    if (password !== confirm) return setError("Las contraseñas no coinciden");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(0 0% 97%) 0%, hsl(0 0% 93%) 50%, hsl(48 30% 93%) 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[hsl(0,0%,90%)] p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(48,100%,50%)]/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-[hsl(48,100%,42%)]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(0,0%,10%)]">Nueva contraseña</h1>
          <p className="text-[hsl(0,0%,45%)] text-sm mt-2">
            {ready ? "Elige tu nueva contraseña" : "Validando enlace..."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-[hsl(0,0%,45%)] uppercase tracking-wider block mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!ready}
              className="w-full bg-[hsl(0,0%,97%)] border border-[hsl(0,0%,88%)] rounded-xl px-4 py-3 text-[hsl(0,0%,10%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(48,100%,50%)]/50 focus:border-[hsl(48,100%,50%)] transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[hsl(0,0%,45%)] uppercase tracking-wider block mb-2">
              Repetir
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={!ready}
              className="w-full bg-[hsl(0,0%,97%)] border border-[hsl(0,0%,88%)] rounded-xl px-4 py-3 text-[hsl(0,0%,10%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(48,100%,50%)]/50 focus:border-[hsl(48,100%,50%)] transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[hsl(0,84%,60%)] text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full bg-[hsl(48,100%,50%)] text-[hsl(0,0%,8%)] font-bold text-sm py-3.5 rounded-full hover:brightness-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
