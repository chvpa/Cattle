import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, UserCircle2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";

export function MetricsGrid() {
  const [metrics, setMetrics] = useState({
    totalCattle: 0,
    genderDistribution: { male: 0, female: 0 },
    pregnancyStatus: { pregnant: 0, notPregnant: 0 },
    averageAge: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMetrics() {
      if (!user) return;

      try {
        // Get all animals
        const { data: animals, error } = await supabase
          .from("animals")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (!animals || animals.length === 0) return;

        // Calculate metrics
        const totalCattle = animals.length;

        const males = animals.filter((a) => a.gender === "male").length;
        const females = animals.filter((a) => a.gender === "female").length;

        const pregnant = animals.filter((a) => a.status === "pregnant").length;
        const notPregnant = females - pregnant;

        // Calculate average age
        const today = new Date();
        const ages = animals.map((animal) => {
          const birthDate = new Date(animal.birth_date);
          const ageInYears =
            (today.getTime() - birthDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25);
          return ageInYears;
        });

        const averageAge =
          ages.length > 0
            ? parseFloat(
                (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(
                  1,
                ),
              )
            : 0;

        setMetrics({
          totalCattle,
          genderDistribution: { male: males, female: females },
          pregnancyStatus: { pregnant, notPregnant },
          averageAge,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }

    fetchMetrics();
  }, [user]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
          <Beef className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalCattle}</div>
          <p className="text-xs text-muted-foreground">Animales registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Distribución por Género
          </CardTitle>
          <div className="flex space-x-1">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="text-2xl font-bold">
                {metrics.genderDistribution.male}
              </div>
              <p className="text-xs text-muted-foreground">Machos</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {metrics.genderDistribution.female}
              </div>
              <p className="text-xs text-muted-foreground">Hembras</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Estado de Preñez
          </CardTitle>
          <UserCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="text-2xl font-bold">
                {metrics.pregnancyStatus.pregnant}
              </div>
              <p className="text-xs text-muted-foreground">Preñadas</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {metrics.pregnancyStatus.notPregnant}
              </div>
              <p className="text-xs text-muted-foreground">No Preñadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Edad Promedio</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageAge} años</div>
          <p className="text-xs text-muted-foreground">Promedio del ganado</p>
        </CardContent>
      </Card>
    </div>
  );
}
