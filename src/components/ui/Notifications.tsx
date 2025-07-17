import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import { useAppContext } from "@/components/AppProvider";
import { createPortal } from "react-dom";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  type?: 'success' | 'error' | 'info';
}

// --- Componente Notifications: notificaciones accesibles y en tiempo real ---
export default function Notifications() {
  const { lang } = useAppContext();
  const t = {
    es: {
      notifications: "Notificaciones",
      loading: "Cargando...",
      empty: "Sin notificaciones.",
      markAll: "Marcar todas",
      deleteAll: "Borrar todas",
      read: "Marcar como leída",
      delete: "Borrar notificación",
      noPermission: "No tienes permiso",
    },
    en: {
      notifications: "Notifications",
      loading: "Loading...",
      empty: "No notifications.",
      markAll: "Mark all",
      deleteAll: "Delete all",
      read: "Mark as read",
      delete: "Delete notification",
      noPermission: "No permission",
    }
  }[lang];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // para el botón
  const panelRef = useRef<HTMLDivElement>(null); // para el cuadro
  const [isClient, setIsClient] = useState(false);
  const [preferences, setPreferences] = useState<{ push_notifications: boolean } | null>(null);

  useEffect(() => { 
    setIsClient(true); 
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, [userId]);

  // Actualización en tiempo real
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications((prev) => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
        } else if (payload.eventType === 'DELETE') {
          setNotifications((prev) => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId]);

  // Obtener preferencias del usuario
  useEffect(() => {
    if (!userId) return;
    const fetchPreferences = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('push_notifications')
        .eq('user_id', userId)
        .single();
      if (!error && data) setPreferences(data);
      else setPreferences(null);
    };
    fetchPreferences();
  }, [userId]);

  // Cerrar dropdown al hacer click fuera (adaptado para portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const deleteAllNotifications = async () => {
    await supabase.from('notifications').delete().eq('user_id', userId);
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label={t.notifications}
        className={`relative p-2 rounded-full hover:bg-accent focus:outline-none focus:ring transition-colors ${loading ? 'animate-pulse' : ''}`}
        onClick={() => {
          setOpen((o) => !o);
        }}
        // disabled={loading} // Ya no deshabilitamos por loading
      >
        <FiBell className={`w-6 h-6 text-primary ${loading ? 'opacity-60' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full px-1.5 py-0.5 border-2 border-card animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 max-w-[90vw] z-[200] bg-popover border border-border rounded-lg shadow-2xl overflow-y-auto max-h-[80vh] p-2 translate-x-6"
            role="menu"
            aria-label={t.notifications}
          >
            {preferences && preferences.push_notifications === false ? (
              <div className="p-6 text-center text-muted-foreground text-base">
                {t.noPermission} <br />
                <span className="text-xs">(Activa las notificaciones push en configuración para verlas aquí)</span>
              </div>
            ) : (
            <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
               <span className="font-semibold text-sm">{t.notifications}</span>
               <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={unreadCount === 0 ? "outline" : "default"}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors ${unreadCount === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    aria-label={t.markAll}
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>{t.markAll}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={notifications.length === 0 ? "outline" : "destructive"}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors ${notifications.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={deleteAllNotifications}
                    disabled={notifications.length === 0}
                    aria-label={t.deleteAll}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>{t.deleteAll}</span>
                  </Button>
                </div>
              </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm animate-pulse">{t.loading}</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">{t.empty}</div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.18 }}
                      className={`flex items-start gap-2 px-4 py-3 text-sm transition-colors ${n.read ? 'bg-muted' : 'bg-accent/60'}`}
                    >
                      {/* Icono según tipo */}
                      {n.type === 'success' && <span className="mt-1 text-green-500"><FiCheck /></span>}
                      {n.type === 'error' && <span className="mt-1 text-red-500"><FiTrash2 /></span>}
                      {(!n.type || n.type === 'info') && <span className="mt-1 text-blue-500"><FiBell /></span>}
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{n.title}</div>
                        <div className="text-muted-foreground text-xs mb-1">{n.body}</div>
                        <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {!n.read && (
                          <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} aria-label={t.read}>
                            <FiCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => deleteNotification(n.id)} aria-label={t.delete}>
                          <FiTrash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 