"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const registerTranslations = {
  es: {
    title: "Crear Cuenta",
    subtitle: "Únete a EcoRecicla y comienza a hacer la diferencia",
    name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    register: "Crear cuenta",
    haveAccount: "¿Ya tienes cuenta?",
    login: "Inicia sesión aquí",
    terms: "Al registrarte, aceptas nuestros términos y condiciones",
    error: "Ocurrió un error al crear la cuenta.",
    passwordMismatch: "Las contraseñas no coinciden.",
    success: "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.",
  },
  en: {
    title: "Create Account",
    subtitle: "Join EcoRecicla and start making a difference",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    register: "Create account",
    haveAccount: "Already have an account?",
    login: "Sign in here",
    terms: "By registering, you agree to our terms and conditions",
    error: "There was an error creating the account.",
    passwordMismatch: "Passwords do not match.",
    success: "Account created! Check your email to confirm your account.",
  },
} as const;

export default function RegisterPage() {
  const { lang } = useAppContext();
  const t = registerTranslations[lang];
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    });
    setLoading(false);
    if (error) {
      setError(t.error);
    } else {
      setSuccess(t.success);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">📝</div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label={t.name}
              name="name"
              placeholder="Tu nombre completo"
              value={form.name}
              onChange={handleChange}
              required
            />
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
            <Input
              type="password"
              label={t.confirmPassword}
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "..." : t.register}
            </Button>
            {error && <div className="text-destructive text-center text-sm mt-2">{error}</div>}
            {success && <div className="text-green-600 text-center text-sm mt-2">{success}</div>}
          </form>
          <div className="text-center space-y-2">
            <Link href="/login" className="text-sm text-primary hover:underline">
              {t.haveAccount} {t.login}
            </Link>
            <p className="text-xs text-muted-foreground">
              {t.terms}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 