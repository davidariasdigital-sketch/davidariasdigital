import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Trash2, Edit2, X, User, Building2, UtensilsCrossed, Scissors, Heart, Scale, Music, Sparkles, Leaf, ShoppingBag, Dumbbell, Coffee, Palette, Star, Briefcase, Store } from "lucide-react";
import { toast } from "sonner";

const BRAND_CLIENTS = [
"La Pescadería", "Uva de lujo", "Palmetto", "El Cortijo", "Comité Olímpico",
"Hunts", "Coloriss", "TQ", "Yanko", "Satillos", "La Cava",
"Nutricionista Natalia Valencia", "Hair Beauty", "Kimeline", "Angus Burguer",
"Michelangelo", "Restaurante 1975", "Epioné", "Rombo Quadrado", "Jazz Café",
"Joykeys", "Salon IN", "Iluminata", "Impocali", "Self", "Nize", "Atavico",
"Vitane", "Shibumi", "Luminance", "Tanga", "Suarez Abogados", "Dermocorea",
"Resonance", "Aromasense", "Greencode", "Deopies", "Muss", "Follies",
"Recamier Corp", "Ruuts", "Whitman", "Sra Buenaventura"];

interface Client {
  id: string; name: string; email: string | null; phone: string | null;
  company: string | null; notes: string | null; created_at: string;
}

const ICON_MAP: Record<string, typeof User> = {
  "La Pescadería": UtensilsCrossed, "Angus Burguer": UtensilsCrossed,
  "Restaurante 1975": UtensilsCrossed, "Jazz Café": Coffee, "La Cava": Coffee,
  "Hair Beauty": Scissors, "Salon IN": Scissors, "Kimeline": Scissors,
  "Epioné": Heart, "Dermocorea": Heart, "Vitane": Heart, "Deopies": Heart,
  "Nutricionista Natalia Valencia": Heart, "Aromasense": Sparkles,
  "Luminance": Sparkles, "Iluminata": Sparkles, "Self": Sparkles,
  "Recamier Corp": Sparkles, "Coloriss": Palette, "Rombo Quadrado": Palette,
  "Greencode": Leaf, "Palmetto": Leaf, "Uva de lujo": Leaf,
  "Suarez Abogados": Scale, "Comité Olímpico": Dumbbell,
  "Joykeys": Music, "Resonance": Music, "Muss": Music, "Follies": Music,
  "Tanga": ShoppingBag, "Nize": ShoppingBag, "Ruuts": ShoppingBag,
  "Sra Buenaventura": Star, "Shibumi": Star, "Atavico": Star,
  "Hunts": Store, "TQ": Briefcase, "Yanko": Briefcase, "Satillos": Store,
  "Impocali": Building2, "Whitman": Briefcase, "Michelangelo": UtensilsCrossed,
  "El Cortijo": UtensilsCrossed
};

const COLORS = [
  "bg-primary/15 text-primary",
  "bg-amber-500/15 text-amber-700",
  "bg-emerald-500/15 text-emerald-700",
  "bg-rose-500/15 text-rose-700",
  "bg-violet-500/15 text-violet-700",
  "bg-sky-500/15 text-sky-700",
  "bg-orange-500/15 text-orange-700",
];

const getClientIcon = (name: string) => ICON_MAP[name] || User;
const getClientColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const ClientsView = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
  };

  useEffect(() => { fetchClients(); }, []);

  const seedClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = clients.map((c) => c.name.toLowerCase());
    const toInsert = BRAND_CLIENTS
      .filter((name) => !existing.includes(name.toLowerCase()))
      .map((name) => ({ name, user_id: user.id }));
    if (toInsert.length === 0) { toast.info("Todos los clientes ya están agregados"); return; }
    const { error } = await supabase.from("clients").insert(toInsert);
    if (error) { toast.error("Error al importar"); return; }
    toast.success(`${toInsert.length} clientes importados`);
    fetchClients();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editing) {
      await supabase.from("clients").update(form).eq("id", editing.id);
    } else {
      await supabase.from("clients").insert({ ...form, user_id: user.id });
    }
    setForm({ name: "", email: "", phone: "", company: "", notes: "" });
    setShowForm(false);
    setEditing(null);
    fetchClients();
  };

  const handleEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    fetchClients();
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full dash-input rounded-xl px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">Clientes</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", email: "", phone: "", company: "", notes: "" }); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-full hover:shadow-lg transition-all">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-text-muted))]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full dash-input rounded-full pl-10 pr-4 py-2.5 text-sm"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="dash-tile rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[hsl(var(--dash-text))]">{editing ? "Editar cliente" : "Nuevo cliente"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className={inputCls} />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputCls} />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" className={inputCls} />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" className={inputCls} />
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas" className={`${inputCls} min-h-[60px]`} />
          <button type="submit" className="btn-dark text-sm px-6 py-2.5">
            {editing ? "Guardar" : "Crear"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((c) => {
          const Icon = getClientIcon(c.name);
          const color = getClientColor(c.name);
          return (
            <div
              key={c.id}
              className="dash-tile aspect-square p-4 flex flex-col items-center justify-center text-center relative group rounded-2xl"
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(c)} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] p-1 rounded-lg hover:bg-[hsl(0,0%,96%)]"><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(c.id)} className="text-[hsl(var(--dash-text-muted))] hover:text-destructive p-1 rounded-lg hover:bg-red-50"><Trash2 size={12} /></button>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={22} className="text-inherit" />
              </div>
              <p className="font-semibold text-[hsl(var(--dash-text))] text-xs leading-tight line-clamp-2">{c.name}</p>
              {c.company && <p className="text-[10px] text-[hsl(var(--dash-text-muted))] mt-1 truncate w-full">{c.company}</p>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-[hsl(var(--dash-text-muted))] text-sm py-8">No hay clientes aún</div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;