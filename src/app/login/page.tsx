"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) {
      setError(t.error);
    } else {
      router.push("/"); // Redirige al home o dashboard
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
            <Input
              type="password"
              label={t.password}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
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