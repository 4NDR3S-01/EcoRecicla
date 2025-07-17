import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { supabase } from "@/lib/supabaseClient";

interface RecyclingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export function RecyclingModal({ isOpen, onClose, onSuccess }: RecyclingModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    material_type: "plastic",
    amount: "",
    location: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const materialTypes = [
    { value: "plastic", label: "Plástico", icon: "🥤", points: 20 },
    { value: "paper", label: "Papel", icon: "📄", points: 18 },
    { value: "glass", label: "Vidrio", icon: "🍷", points: 25 },
    { value: "metal", label: "Metal", icon: "🥫", points: 35 },
    { value: "organic", label: "Orgánico", icon: "🍃", points: 15 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError("Error de autenticación");
        return;
      }

      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("Ingresa una cantidad válida");
        return;
      }

      const selectedMaterial = materialTypes.find(m => m.value === form.material_type);
      const pointsEarned = Math.round(amount * (selectedMaterial?.points || 20));

      // Registrar el reciclaje
      const { error: recordError } = await supabase
        .from('recycling_records')
        .insert({
          user_id: user.id,
          material_type: form.material_type,
          amount: amount,
          points_earned: pointsEarned,
          location: form.location || null,
          notes: form.notes || null,
          status: 'verified'
        });

      if (recordError) throw recordError;

      // Actualizar puntos del usuario
      const { data: currentPoints } = await supabase
        .from('user_points')
        .select('total_points, current_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentPoints?.last_activity_date;
      let newStreak = currentPoints?.current_streak || 0;

      // Calcular nueva racha
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1; // Día consecutivo
        } else if (diffDays > 1) {
          newStreak = 1; // Reiniciar racha
        }
        // Si diffDays === 0, mantener la racha actual (mismo día)
      } else {
        newStreak = 1; // Primera actividad
      }

      await supabase
        .from('user_points')
        .update({
          total_points: (currentPoints?.total_points || 0) + pointsEarned,
          current_streak: newStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Actualizar perfil del usuario
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('total_recycled_kg, total_points')
        .eq('id', user.id)
        .single();

      await supabase
        .from('user_profiles')
        .update({
          total_recycled_kg: (currentProfile?.total_recycled_kg || 0) + amount,
          total_points: (currentProfile?.total_points || 0) + pointsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Limpiar formulario y cerrar modal
      setForm({
        material_type: "plastic",
        amount: "",
        location: "",
        notes: "",
      });
      
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Error registering recycling:', error);
      setError(error.message || "Error al registrar el reciclaje");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📝 Registrar Reciclaje</span>
            <Button variant="outline" size="sm" onClick={onClose}>✕</Button>
          </CardTitle>
          <CardDescription>
            Registra tu actividad de reciclaje y gana puntos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de material */}
            <div>
              <label htmlFor="material_type" className="block text-sm font-medium text-foreground mb-2">
                Tipo de Material
              </label>
              <select
                id="material_type"
                name="material_type"
                value={form.material_type}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                required
              >
                {materialTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label} (+{type.points} pts/kg)
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <Input
              type="number"
              label="Cantidad (kg)"
              name="amount"
              placeholder="0.0"
              value={form.amount}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              required
            />

            {/* Ubicación */}
            <Input
              type="text"
              label="Ubicación (opcional)"
              name="location"
              placeholder="Ej: Casa, Oficina, Centro de reciclaje"
              value={form.location}
              onChange={handleChange}
            />

            {/* Notas */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Detalles adicionales..."
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                rows={3}
              />
            </div>

            {/* Estimación de puntos */}
            {form.amount && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground">
                  Puntos estimados: <span className="font-bold text-primary">
                    {Math.round(parseFloat(form.amount || "0") * (materialTypes.find(m => m.value === form.material_type)?.points || 20))}
                  </span>
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
