"use client";
import { useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";
import zxcvbn from "zxcvbn";

const translations = {
  es: {
    title: "Restablecer contraseña",
    subtitle: "Ingresa tu nueva contraseña.",
    password: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    save: "Guardar nueva contraseña",
    success: "¡Contraseña restablecida correctamente! Ahora puedes iniciar sesión.",
    error: "Ocurrió un error. Intenta de nuevo.",
    mismatch: "Las contraseñas no coinciden.",
    minLength: "La contraseña debe tener al menos 6 caracteres.",
    back: "Volver al inicio de sesión"
  },
  en: {
    title: "Reset password",
    subtitle: "Enter your new password.",
    password: "New password",
    confirmPassword: "Confirm password",
    save: "Save new password",
    success: "Password reset successfully! You can now log in.",
    error: "An error occurred. Please try again.",
    mismatch: "Passwords do not match.",
    minLength: "Password must be at least 6 characters.",
    back: "Back to login"
  }
};

export default function ResetPasswordPage() {
  const { lang } = useAppContext();
  const t = translations[lang];
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    const result = zxcvbn(e.target.value);
    setPasswordScore(result.score);
    setPasswordFeedback(result.feedback.suggestions[0] || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (password.length < 6) {
      setError(t.minLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.mismatch);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
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
          <div className="mx-auto mb-4 text-4xl">🔑</div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label={t.password}
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {/* Barra de fortaleza de contraseña */}
            {password && (
              <div className="mt-2" aria-live="polite">
                <div className="h-2 w-full rounded bg-muted flex">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${
                      passwordScore === 0 ? "w-1/5 bg-red-500" :
                      passwordScore === 1 ? "w-2/5 bg-orange-500" :
                      passwordScore === 2 ? "w-3/5 bg-yellow-500" :
                      passwordScore === 3 ? "w-4/5 bg-green-400" :
                      "w-full bg-green-600"}
                    `}
                    style={{ minWidth: "8%" }}
                  />
                </div>
                <div className="text-xs mt-1 text-foreground">
                  {[
                    "Muy débil",
                    "Débil",
                    "Aceptable",
                    "Fuerte",
                    "Muy fuerte"
                  ][passwordScore]}
                  {passwordFeedback && (
                    <span className="ml-2 text-muted-foreground">- {passwordFeedback}</span>
                  )}
                </div>
              </div>
            )}
            <Input
              type="password"
              label={t.confirmPassword}
              name="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "..." : t.save}
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