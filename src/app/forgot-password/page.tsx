"use client";
import { useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";

const translations = {
  es: {
    title: "¿Olvidaste tu contraseña?",
    subtitle: "Te enviaremos un enlace para restablecer tu contraseña.",
    email: "Correo electrónico",
    send: "Enviar enlace",
    success: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    error: "Ocurrió un error. Intenta de nuevo.",
    back: "Volver al inicio de sesión"
  },
  en: {
    title: "Forgot your password?",
    subtitle: "We'll send you a link to reset your password.",
    email: "Email",
    send: "Send link",
    success: "If the email is registered, you'll receive a link to reset your password.",
    error: "An error occurred. Please try again.",
    back: "Back to login"
  }
};

export default function ForgotPasswordPage() {
  const { lang } = useAppContext();
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(t.error);
    } else {
      setMessage(t.success);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🔒</div>
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "..." : t.send}
            </Button>
            {message && <div className="text-green-600 text-center text-sm mt-2">{message}</div>}
            {error && <div className="text-destructive text-center text-sm mt-2">{error}</div>}
          </form>
          <div className="text-center mt-4">
            <a href="/login" className="text-sm text-primary hover:underline">{t.back}</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 