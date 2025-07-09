"use client";
import { useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";

const contactTranslations = {
  es: {
    title: "Contacto",
    subtitle: "¿Tienes preguntas? Nos encantaría escucharte",
    form: {
      name: "Nombre completo",
      email: "Correo electrónico",
      subject: "Asunto",
      message: "Mensaje",
      send: "Enviar mensaje",
      success: "¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.",
      error: "Ocurrió un error al enviar el mensaje. Intenta de nuevo.",
    },
    info: {
      title: "Información de Contacto",
      email: "info@ecorecicla.com",
      phone: "+1 (555) 123-4567",
      address: "123 Calle Verde, Ciudad Sostenible",
      hours: "Lun - Vie: 9:00 AM - 6:00 PM",
    },
    social: {
      title: "Síguenos",
      description: "Mantente conectado con nosotros en redes sociales",
    }
  },
  en: {
    title: "Contact",
    subtitle: "Have questions? We'd love to hear from you",
    form: {
      name: "Full name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      send: "Send message",
      success: "Message sent successfully! We'll get in touch soon.",
      error: "There was an error sending the message. Please try again.",
    },
    info: {
      title: "Contact Information",
      email: "info@ecorecicla.com",
      phone: "+1 (555) 123-4567",
      address: "123 Green Street, Sustainable City",
      hours: "Mon - Fri: 9:00 AM - 6:00 PM",
    },
    social: {
      title: "Follow us",
      description: "Stay connected with us on social media",
    }
  },
} as const;

export default function ContactPage() {
  const { lang } = useAppContext();
  const t = contactTranslations[lang];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    const { data, error } = await supabase.from("contact_messages").insert([
      { name: form.name, email: form.email, subject: form.subject, message: form.message }
    ]);
    setLoading(false);
    if (error) {
      setError(t.form.error);
    } else {
      setSuccess(t.form.success);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y nos pondremos en contacto contigo pronto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    label={t.form.name}
                    name="name"
                    placeholder="Tu nombre completo"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="email"
                    label={t.form.email}
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="text"
                    label={t.form.subject}
                    name="subject"
                    placeholder="Asunto de tu mensaje"
                    value={form.subject}
                    onChange={handleChange}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t.form.message}
                    </label>
                    <textarea
                      name="message"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[120px] resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button className="w-full" size="lg" type="submit" disabled={loading}>
                    {loading ? "..." : t.form.send}
                  </Button>
                  {success && <div className="text-green-600 text-center text-sm mt-2">{success}</div>}
                  {error && <div className="text-destructive text-center text-sm mt-2">{error}</div>}
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Card>
                <CardHeader>
                  <CardTitle>{t.info.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📧</div>
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground">{t.info.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📞</div>
                    <div>
                      <div className="font-medium text-foreground">Teléfono</div>
                      <div className="text-sm text-muted-foreground">{t.info.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📍</div>
                    <div>
                      <div className="font-medium text-foreground">Dirección</div>
                      <div className="text-sm text-muted-foreground">{t.info.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🕒</div>
                    <div>
                      <div className="font-medium text-foreground">Horarios</div>
                      <div className="text-sm text-muted-foreground">{t.info.hours}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.social.title}</CardTitle>
                  <CardDescription>{t.social.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com/ecorecicla" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <span className="text-xl">📘</span>
                    </a>
                    <a href="https://twitter.com/ecorecicla" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <span className="text-xl">🐦</span>
                    </a>
                    <a href="https://instagram.com/ecorecicla" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <span className="text-xl">📷</span>
                    </a>
                    <a href="https://linkedin.com/company/ecorecicla" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <span className="text-xl">💼</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 