import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trash2, Edit2, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface ServiceCost {
  id: string;
  category: string;
  service: string;
  description: string | null;
  price: number;
  unit: string | null;
  created_at: string;
}

const CATEGORIES = [
  "Fotografía",
  "Video",
  "Edición",
  "Dirección creativa",
  "Redes sociales",
  "Otro",
];

const ServiceCostsView = () => {
  const [items, setItems] = useState<ServiceCost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const isMobile = useIsMobile();

  // Form state
  const [category, setCategory] = useState("Video");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("por servicio");

  const fetchItems = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("service_costs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("category")
      .order("service");
    if (data) setItems(data);
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setCategory("Video");
    setService("");
    setDescription("");
    setPrice("");
    setUnit("por servicio");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !service.trim()) return;

    const payload = {
      user_id: session.user.id,
      category,
      service: service.trim(),
      description: description.trim() || null,
      price: parseFloat(price) || 0,
      unit: unit.trim() || "por servicio",
    };

    if (editingId) {
      await supabase.from("service_costs").update(payload).eq("id", editingId);
    } else {
      await supabase.from("service_costs").insert(payload);
    }
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: ServiceCost) => {
    setCategory(item.category);
    setService(item.service);
    setDescription(item.description || "");
    setPrice(String(item.price));
    setUnit(item.unit || "por servicio");
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("service_costs").delete().eq("id", id);
    fetchItems();
  };

  const filtered = items.filter((i) => {
    const matchSearch =
      !search ||
      i.service.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || i.category === filterCat;
    return matchSearch && matchCat;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, ServiceCost[]>>((acc, item) => {
    const cat = item.category || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider block mb-1.5">Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider block mb-1.5">Servicio *</label>
        <input value={service} onChange={(e) => setService(e.target.value)}
          className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]"
          placeholder="Ej: Video corporativo" />
      </div>
      <div>
        <label className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider block mb-1.5">Descripción</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]"
          placeholder="Descripción breve del servicio" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider block mb-1.5">Precio (COP)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]"
            placeholder="0" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider block mb-1.5">Unidad</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)}
            className="w-full bg-[hsl(var(--dash-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]"
            placeholder="por servicio" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave}
          className="flex-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold py-2.5 rounded-full hover:opacity-90 transition-opacity">
          {editingId ? "Guardar cambios" : "Añadir servicio"}
        </button>
        <button onClick={resetForm}
          className="px-4 py-2.5 text-sm text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))] transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[hsl(var(--dash-text))]">
            Tabla de Costos
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--dash-text-muted))]">
            {items.length} servicio{items.length !== 1 ? "s" : ""} registrado{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
          <Plus size={16} /> Nuevo servicio
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-text-muted))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[hsl(var(--dash-card-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[hsl(var(--dash-text))] placeholder:text-[hsl(var(--dash-text-muted))]"
            placeholder="Buscar servicio..." />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[hsl(var(--dash-card-bg))] border border-[hsl(var(--dash-card-border))] rounded-xl px-3 py-2.5 text-sm text-[hsl(var(--dash-text))]">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Form */}
      {isMobile ? (
        <Drawer open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>{editingId ? "Editar" : "Nuevo"} servicio</DrawerTitle>
              <DrawerDescription>Completa los datos del servicio</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">{formContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        showForm && (
          <div className="dash-tile p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[hsl(var(--dash-text))]">
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </h2>
              <button onClick={resetForm} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]">
                <X size={18} />
              </button>
            </div>
            {formContent}
          </div>
        )
      )}

      {/* Table */}
      {Object.keys(grouped).length === 0 ? (
        <div className="dash-tile p-8 text-center">
          <p className="text-[hsl(var(--dash-text-muted))] text-sm">
            {items.length === 0 ? "No hay servicios registrados aún." : "No se encontraron resultados."}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="space-y-2">
            <h3 className="text-xs font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider px-1">
              {cat}
            </h3>
            {/* Desktop table */}
            <div className="hidden sm:block dash-tile overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--dash-card-border))]">
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Servicio</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Descripción</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Precio</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-[hsl(var(--dash-text-muted))] uppercase tracking-wider">Unidad</th>
                    <th className="py-3 px-4 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {catItems.map((item) => (
                    <tr key={item.id} className="border-b border-[hsl(var(--dash-card-border))] last:border-0 hover:bg-[hsl(var(--dash-bg))] transition-colors">
                      <td className="py-3 px-4 font-medium text-[hsl(var(--dash-text))]">{item.service}</td>
                      <td className="py-3 px-4 text-[hsl(var(--dash-text-muted))]">{item.description || "—"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[hsl(var(--dash-text))]">{formatPrice(item.price)}</td>
                      <td className="py-3 px-4 text-[hsl(var(--dash-text-muted))]">{item.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--dash-bg))] text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--primary))] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[hsl(var(--dash-text-muted))] hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="dash-tile p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[hsl(var(--dash-text))]">{item.service}</p>
                      {item.description && (
                        <p className="text-xs text-[hsl(var(--dash-text-muted))] mt-0.5 truncate">{item.description}</p>
                      )}
                      <p className="text-sm font-bold text-[hsl(var(--primary))] mt-1.5">{formatPrice(item.price)}</p>
                      <p className="text-[10px] text-[hsl(var(--dash-text-muted))] uppercase">{item.unit}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--primary))]">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-[hsl(var(--dash-text-muted))] hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ServiceCostsView;
