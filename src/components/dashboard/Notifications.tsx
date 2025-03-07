import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Notification = {
  id: string;
  type: "vaccine" | "event";
  title: string;
  description: string;
  date: string;
  isRead: boolean;
};

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Fetch notifications from database
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;

      try {
        // Get upcoming vaccines (next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const { data: vaccines, error: vaccineError } = await supabase
          .from("vaccines")
          .select("*, animals(name, tag)")
          .eq("user_id", user.id)
          .gte("next_date", today.toISOString().split("T")[0])
          .lte("next_date", nextWeek.toISOString().split("T")[0]);

        if (vaccineError) throw vaccineError;

        // Transform vaccine data into notifications
        const vaccineNotifications = (vaccines || []).map((vaccine: any) => {
          const daysUntil = Math.ceil(
            (new Date(vaccine.next_date).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          return {
            id: vaccine.id,
            type: "vaccine",
            title: "Vacunación Pendiente",
            description: `${vaccine.animals.name} (${vaccine.animals.tag}) necesita ${vaccine.vaccine_type}`,
            date:
              daysUntil === 0
                ? "Hoy"
                : daysUntil === 1
                  ? "Mañana"
                  : `En ${daysUntil} días`,
            isRead: false,
          };
        });

        // Add some static event notifications for demo
        const staticNotifications: Notification[] = [
          {
            id: "static-1",
            type: "event",
            title: "Revisión Veterinaria",
            description:
              "Visita programada del veterinario para chequeo general",
            date: "En 3 días",
            isRead: true,
          },
        ];

        setNotifications([...vaccineNotifications, ...staticNotifications]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchNotifications();

    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    // In a real app, you would update the read status in the database here
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    // In a real app, you would update the read status in the database here
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      <div className="relative">
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Notification panel */}
        <div
          className={`absolute bottom-12 right-0 w-80 ${isOpen ? "block" : "hidden"} md:w-96`}
        >
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Notificaciones</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={markAllAsRead}
                >
                  Marcar todas como leídas
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay notificaciones
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-lg border ${notification.isRead ? "bg-background" : "bg-muted/30"}`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${notification.type === "vaccine" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
                        >
                          {notification.type === "vaccine"
                            ? "Vacuna"
                            : "Evento"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium">
                          {notification.date}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
