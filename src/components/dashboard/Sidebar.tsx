import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, ClipboardList, Settings, Bell } from "lucide-react";

type Activity = {
  id: string;
  description: string;
  time: string;
};

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function Sidebar() {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return;

      try {
        // Fetch recent animals added
        const { data: animals, error: animalsError } = await supabase
          .from("animals")
          .select("id, name, tag, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (animalsError) throw animalsError;

        // Fetch recent vaccines added
        const { data: vaccines, error: vaccinesError } = await supabase
          .from("vaccines")
          .select(
            "id, vaccine_type, date, created_at, animal_id, animals(name, tag)",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (vaccinesError) throw vaccinesError;

        // Transform to activities
        const animalActivities = (animals || []).map((animal) => ({
          id: `animal-${animal.id}`,
          description: `Nuevo animal registrado: ${animal.name} (${animal.tag})`,
          time: formatTimeAgo(animal.created_at),
          date: new Date(animal.created_at),
        }));

        const vaccineActivities = (vaccines || []).map((vaccine: any) => ({
          id: `vaccine-${vaccine.id}`,
          description: `Vacuna ${vaccine.vaccine_type} aplicada: ${vaccine.animals.name}`,
          time: formatTimeAgo(vaccine.created_at),
          date: new Date(vaccine.created_at),
        }));

        // Combine and sort by date
        const allActivities = [...animalActivities, ...vaccineActivities]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);

        setRecentActivities(allActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    }

    fetchActivities();

    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchActivities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Format time ago in Spanish
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
      .replace("hace", "Hace")
      .replace("menos de un minuto", "1 minuto");
  }

  return (
    <div className="w-64 border-l bg-card h-[calc(100vh-64px)] hidden md:block">
      <div className="p-4 space-y-4">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Vista General
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ClipboardList className="h-4 w-4" />
            Control
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Ajustes
          </Button>
        </nav>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Actividad Reciente</h3>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay actividad reciente
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
