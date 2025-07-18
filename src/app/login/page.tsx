"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const loginTranslations = {
  es: {
    title: "Iniciar Sesión",
    subtitle: "Accede a tu cuenta de EcoRecicla",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Iniciar sesión",
    noAccount: "¿No tienes cuenta?",
    register: "Regístrate aquí",
    forgotPassword: "¿Olvidaste tu contraseña?",
    error: "Correo o contraseña incorrectos.",
  },
  en: {
    title: "Sign In",
    subtitle: "Access your EcoRecicla account",
    email: "Email",
    password: "Password",
    login: "Sign in",
    noAccount: "Don't have an account?",
    register: "Sign up here",
    forgotPassword: "Forgot your password?",
    error: "Incorrect email or password.",
  },
} as const;

export default function LoginPage() {
  const { lang } = useAppContext();
  const t = loginTranslations[lang];
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" }); // Limpiar error al escribir
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!form.email.includes("@")) {
      errors.email = lang === "es" ? "Ingresa un correo válido." : "Enter a valid email.";
    }
    if (!form.password) {
      errors.password = lang === "es" ? "La contraseña es obligatoria." : "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    
    console.log("🔍 Iniciando proceso de login...");
    console.log("📧 Email:", form.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      
      console.log("📊 Respuesta de Supabase:", { data, error });
      
      if (error) {
        console.error("❌ Error de login:", error.message);
        setError(`${t.error} - ${error.message}`);
      } else {
        console.log("✅ Login exitoso, verificando perfil...");
        
        // Verificar si el usuario tiene perfil completo
        if (data.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (!profile) {
            console.log("📝 Creando perfil faltante...");
            // Crear perfil básico si no existe (para usuarios registrados antes de esta actualización)
            await supabase.from('user_profiles').insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || '',
              phone: data.user.user_metadata?.phone || null,
              location: data.user.user_metadata?.location || null,
            });
            
            // Crear preferencias por defecto
            await supabase.from('user_preferences').insert({
              user_id: data.user.id,
              email_updates: true,
              push_notifications: true,
              weekly_report: false,
              public_profile: true,
              show_stats: true,
              data_sharing: false,
            });
            
            // Crear metas por defecto
            await supabase.from('recycling_goals').insert({
              user_id: data.user.id,
              monthly_goal: 60,
              weekly_goal: 15,
              daily_reminder: true,
            });
            
            // Crear puntos iniciales
            await supabase.from('user_points').insert({
              user_id: data.user.id,
              total_points: 0,
              current_streak: 0,
              longest_streak: 0,
              last_activity_date: null,
            });
          }
        }
        
        // Verificar que la sesión se estableció
        const { data: session } = await supabase.auth.getSession();
        console.log("🔐 Sesión actual:", session);
        
        if (session.session) {
          console.log("🎯 Redirigiendo al dashboard...");
          window.location.href = "/dashboard";
        } else {
          console.error("❌ No se pudo establecer la sesión");
          setError("No se pudo establecer la sesión. Intenta de nuevo.");
        }
      }
    } catch (err) {
      console.error("💥 Error inesperado:", err);
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🔑</div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t.email}
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.email}</div>
            )}
            <Input
              type="password"
              label={t.password}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && (
              <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.password}</div>
            )}
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "..." : t.login}
            </Button>
            {error && <div className="text-destructive text-center text-sm mt-2">{error}</div>}
          </form>
          <div className="text-center space-y-2">
            <Link href="/registro" className="text-sm text-primary hover:underline">
              {t.noAccount} {t.register}
            </Link>
            <div>
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                {t.forgotPassword}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 