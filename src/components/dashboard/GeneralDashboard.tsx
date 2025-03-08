import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Filter,
  Heart,
  LineChart,
  PieChart,
  Printer,
  RefreshCcw,
  Syringe,
  Users,
  Weight,
} from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";

// Chart data will be generated from real data

type KPIData = {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  criticalAnimals: number;
  pregnantCows: number;
  averageAge: number;
  averageWeight: number;
  upToDateVaccinations: number;
  pendingVaccinations: number;
};

type UpcomingEvent = {
  id: string;
  type: "vaccination" | "checkup" | "birth";
  animalName: string;
  animalTag: string;
  date: string;
  description: string;
};

export function GeneralDashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalAnimals: 0,
    healthyAnimals: 0,
    sickAnimals: 0,
    criticalAnimals: 0,
    pregnantCows: 0,
    averageAge: 0,
    averageWeight: 0,
    upToDateVaccinations: 0,
    pendingVaccinations: 0,
  });

  const [healthStatusData, setHealthStatusData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [weightEvolutionData, setWeightEvolutionData] = useState<
    { month: string; weight: number }[]
  >([]);
  const [ownershipData, setOwnershipData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [genderAgeData, setGenderAgeData] = useState<
    {
      gender: string;
      "0-1 año": number;
      "1-3 años": number;
      "3+ años": number;
    }[]
  >([]);

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFarm, setFilterFarm] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch animals data with filter if needed
        let query = supabase.from("animals").select("*").eq("user_id", user.id);

        if (filterFarm !== "all") {
          query = query.eq("owner", filterFarm);
        }

        const { data: animals, error: animalsError } = await query;

        if (animalsError) throw animalsError;

        // Fetch vaccines data
        const { data: vaccines, error: vaccinesError } = await supabase
          .from("vaccines")
          .select("*, animals(name, tag)")
          .eq("user_id", user.id);

        if (vaccinesError) throw vaccinesError;

        // Calculate KPIs
        const totalAnimals = animals?.length || 0;
        const healthyAnimals =
          animals?.filter((a) => a.status === "healthy").length || 0;
        const sickAnimals =
          animals?.filter((a) => a.status === "sick").length || 0;
        const criticalAnimals = 0; // Assuming we don't have a critical status yet
        const pregnantCows =
          animals?.filter((a) => a.status === "pregnant").length || 0;

        // Generate health status chart data
        setHealthStatusData([
          {
            name: "Saludable",
            value: (healthyAnimals / Math.max(totalAnimals, 1)) * 100,
            color: "#22c55e",
          },
          {
            name: "Enfermo",
            value: (sickAnimals / Math.max(totalAnimals, 1)) * 100,
            color: "#f97316",
          },
          {
            name: "Preñada",
            value: (pregnantCows / Math.max(totalAnimals, 1)) * 100,
            color: "#3b82f6",
          },
        ]);

        // Generate ownership distribution data
        const ownerCounts = {};
        const colors = [
          "#3b82f6",
          "#8b5cf6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#6b7280",
        ];

        animals?.forEach((animal) => {
          if (animal.owner) {
            ownerCounts[animal.owner] = (ownerCounts[animal.owner] || 0) + 1;
          }
        });

        const ownershipChartData = Object.entries(ownerCounts).map(
          ([name, count], index) => ({
            name,
            value: ((count as number) / Math.max(totalAnimals, 1)) * 100,
            color: colors[index % colors.length],
          }),
        );

        setOwnershipData(
          ownershipChartData.length > 0
            ? ownershipChartData
            : [{ name: "Sin datos", value: 100, color: "#6b7280" }],
        );

        // Calculate average age
        const today = new Date();
        const ages =
          animals?.map((animal) => {
            const birthDate = new Date(animal.birth_date);
            return (
              (today.getTime() - birthDate.getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
            );
          }) || [];
        const averageAge =
          ages.length > 0
            ? parseFloat(
                (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(
                  1,
                ),
              )
            : 0;

        // Calculate average weight
        const weights =
          animals
            ?.filter((animal) => animal.weight)
            .map((animal) => parseFloat(animal.weight)) || [];
        const averageWeight =
          weights.length > 0
            ? parseFloat(
                (
                  weights.reduce((sum, weight) => sum + weight, 0) /
                  weights.length
                ).toFixed(1),
              )
            : 0;

        // Generate weight evolution data (simulated from real data)
        // In a real app, you would fetch historical weight data from the database
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
        const baseWeight =
          weights.length > 0
            ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length
            : 450;

        const weightData = months.map((month, index) => {
          // Simulate a gradual increase in weight over time
          const weightFactor = 0.95 + index * 0.01;
          return {
            month,
            weight: Math.round(baseWeight * weightFactor),
          };
        });

        setWeightEvolutionData(weightData);

        // Generate gender and age distribution data
        const malesByAge = { "0-1 año": 0, "1-3 años": 0, "3+ años": 0 };
        const femalesByAge = { "0-1 año": 0, "1-3 años": 0, "3+ años": 0 };

        animals?.forEach((animal) => {
          if (!animal.birth_date) return;

          const birthDate = new Date(animal.birth_date);
          const ageInYears =
            (today.getTime() - birthDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25);

          const ageCategory =
            ageInYears < 1
              ? "0-1 año"
              : ageInYears < 3
                ? "1-3 años"
                : "3+ años";

          if (animal.gender === "male") {
            malesByAge[ageCategory]++;
          } else if (animal.gender === "female") {
            femalesByAge[ageCategory]++;
          }
        });

        setGenderAgeData([
          { gender: "Macho", ...malesByAge },
          { gender: "Hembra", ...femalesByAge },
        ]);

        // Calculate vaccination status
        const today_str = new Date().toISOString().split("T")[0];
        const upToDateVaccinations =
          vaccines?.filter((v) => v.next_date && v.next_date > today_str)
            .length || 0;
        const pendingVaccinations =
          vaccines?.filter((v) => v.next_date && v.next_date <= today_str)
            .length || 0;

        setKpiData({
          totalAnimals,
          healthyAnimals,
          sickAnimals,
          criticalAnimals,
          pregnantCows,
          averageAge,
          averageWeight,
          upToDateVaccinations,
          pendingVaccinations,
        });

        // Generate upcoming events
        const events: UpcomingEvent[] = [];

        // Add vaccination events
        vaccines?.forEach((vaccine) => {
          if (vaccine.next_date) {
            const nextDate = new Date(vaccine.next_date);
            const today = new Date();
            const thirtyDaysFromNow = addDays(today, 30);

            if (isBefore(nextDate, thirtyDaysFromNow)) {
              events.push({
                id: `vaccine-${vaccine.id}`,
                type: "vaccination",
                animalName: vaccine.animals.name,
                animalTag: vaccine.animals.tag,
                date: vaccine.next_date,
                description: `Vacuna ${vaccine.vaccine_type} pendiente`,
              });
            }
          }
        });

        // Add birth events for pregnant animals
        animals?.forEach((animal) => {
          if (animal.status === "pregnant") {
            // Estimate birth date (just a mock - in reality would be calculated based on pregnancy date)
            const estimatedBirthDate = addDays(
              new Date(),
              Math.floor(Math.random() * 60) + 30,
            );

            events.push({
              id: `birth-${animal.id}`,
              type: "birth",
              animalName: animal.name,
              animalTag: animal.tag,
              date: estimatedBirthDate.toISOString().split("T")[0],
              description: "Fecha estimada de parto",
            });
          }
        });

        // Add checkup events (mock data)
        animals?.slice(0, 5).forEach((animal) => {
          const checkupDate = addDays(
            new Date(),
            Math.floor(Math.random() * 20) + 1,
          );

          events.push({
            id: `checkup-${animal.id}`,
            type: "checkup",
            animalName: animal.name,
            animalTag: animal.tag,
            date: checkupDate.toISOString().split("T")[0],
            description: "Revisión veterinaria programada",
          });
        });

        // Sort events by date
        events.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, filterFarm]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="h-4 w-4 text-blue-500" />;
      case "checkup":
        return <Heart className="h-4 w-4 text-green-500" />;
      case "birth":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "checkup":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "birth":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Function to handle exporting data
  const handleExport = (format: "pdf" | "excel") => {
    alert(
      `Exportando datos en formato ${format}. Esta funcionalidad se implementará próximamente.`,
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-bold">Panel General</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={filterFarm} onValueChange={setFilterFarm}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por propietario" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los propietarios</SelectItem>
              <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
              <SelectItem value="María González">María González</SelectItem>
              <SelectItem value="Carlos Rodríguez">Carlos Rodríguez</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleExport("excel")}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Animales
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              Animales registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Animales Saludables
            </CardTitle>
            <Heart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.healthyAnimals}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.totalAnimals > 0
                ? `${Math.round((kpiData.healthyAnimals / kpiData.totalAnimals) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Animales Enfermos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.sickAnimals}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.totalAnimals > 0
                ? `${Math.round((kpiData.sickAnimals / kpiData.totalAnimals) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Críticos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.criticalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.totalAnimals > 0
                ? `${Math.round((kpiData.criticalAnimals / kpiData.totalAnimals) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vacas Preñadas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.pregnantCows}</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.totalAnimals > 0
                ? `${Math.round((kpiData.pregnantCows / kpiData.totalAnimals) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edad Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.averageAge} años</div>
            <p className="text-xs text-muted-foreground">Promedio del ganado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Promedio</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.averageWeight} kg</div>
            <p className="text-xs text-muted-foreground">Promedio del ganado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado Vacunación
            </CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-xl font-bold text-green-600">
                  {kpiData.upToDateVaccinations}
                </div>
                <p className="text-xs text-muted-foreground">Al día</p>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">
                  {kpiData.pendingVaccinations}
                </div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribución por Estado de Salud</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {healthStatusData.reduce((acc, item, i) => {
                    const prevTotal =
                      i === 0
                        ? 0
                        : healthStatusData
                            .slice(0, i)
                            .reduce((sum, d) => sum + d.value, 0);

                    const startAngle = (prevTotal / 100) * 360;
                    const endAngle = ((prevTotal + item.value) / 100) * 360;

                    const x1 =
                      50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                    const y1 =
                      50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                    const x2 =
                      50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                    const y2 =
                      50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                    const largeArcFlag = item.value > 50 ? 1 : 0;

                    const pathData = [
                      `M 50 50`,
                      `L ${x1} ${y1}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`,
                    ].join(" ");

                    return [
                      ...acc,
                      <path
                        key={item.name}
                        d={pathData}
                        fill={item.color}
                        stroke="white"
                        strokeWidth="0.5"
                      />,
                    ];
                  }, [])}
                </svg>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {healthStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">
                      {item.name}: {Math.round(item.value)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Evolución de Peso</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-full h-40 mb-4">
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  {/* X and Y axes */}
                  <line
                    x1="40"
                    y1="10"
                    x2="40"
                    y2="120"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <line
                    x1="40"
                    y1="120"
                    x2="290"
                    y2="120"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />

                  {/* Weight line */}
                  <polyline
                    points={weightEvolutionData
                      .map((d, i) => {
                        const x =
                          40 + i * (250 / (weightEvolutionData.length - 1));
                        const minWeight =
                          Math.min(
                            ...weightEvolutionData.map((d) => d.weight),
                          ) - 10;
                        const maxWeight =
                          Math.max(
                            ...weightEvolutionData.map((d) => d.weight),
                          ) + 10;
                        const range = maxWeight - minWeight;
                        const y = 120 - ((d.weight - minWeight) / range) * 100;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  {weightEvolutionData.map((d, i) => {
                    const x = 40 + i * (250 / (weightEvolutionData.length - 1));
                    const minWeight =
                      Math.min(...weightEvolutionData.map((d) => d.weight)) -
                      10;
                    const maxWeight =
                      Math.max(...weightEvolutionData.map((d) => d.weight)) +
                      10;
                    const range = maxWeight - minWeight;
                    const y = 120 - ((d.weight - minWeight) / range) * 100;
                    return (
                      <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />
                    );
                  })}

                  {/* X-axis labels */}
                  {weightEvolutionData.map((d, i) => {
                    const x = 40 + i * (250 / (weightEvolutionData.length - 1));
                    return (
                      <text
                        key={i}
                        x={x}
                        y="135"
                        textAnchor="middle"
                        fontSize="10"
                      >
                        {d.month}
                      </text>
                    );
                  })}

                  {/* Y-axis labels */}
                  {(() => {
                    const minWeight =
                      Math.min(...weightEvolutionData.map((d) => d.weight)) -
                      10;
                    const maxWeight =
                      Math.max(...weightEvolutionData.map((d) => d.weight)) +
                      10;
                    const step = Math.round((maxWeight - minWeight) / 4);
                    return Array.from({ length: 5 }).map((_, i) => {
                      const weight = minWeight + i * step;
                      const y =
                        120 -
                        ((weight - minWeight) / (maxWeight - minWeight)) * 100;
                      return (
                        <text
                          key={i}
                          x="35"
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                        >
                          {weight}
                        </text>
                      );
                    });
                  })()}
                </svg>
              </div>
              <div className="flex justify-between w-full max-w-md">
                {weightEvolutionData.map((item) => (
                  <div key={`weight-${item.month}`} className="text-xs">
                    {item.weight}kg
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribución por Propietario</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {ownershipData.reduce((acc, item, i) => {
                    const prevTotal =
                      i === 0
                        ? 0
                        : ownershipData
                            .slice(0, i)
                            .reduce((sum, d) => sum + d.value, 0);

                    const startAngle = (prevTotal / 100) * 360;
                    const endAngle = ((prevTotal + item.value) / 100) * 360;

                    const x1 =
                      50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                    const y1 =
                      50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                    const x2 =
                      50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                    const y2 =
                      50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                    const largeArcFlag = item.value > 50 ? 1 : 0;

                    const pathData = [
                      `M 50 50`,
                      `L ${x1} ${y1}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`,
                    ].join(" ");

                    return [
                      ...acc,
                      <path
                        key={item.name}
                        d={pathData}
                        fill={item.color}
                        stroke="white"
                        strokeWidth="0.5"
                      />,
                    ];
                  }, [])}
                </svg>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {ownershipData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">
                      {item.name}: {Math.round(item.value)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribución por Género y Edad</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="space-y-6">
                {genderAgeData.map((item) => (
                  <div key={item.gender} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.gender}</span>
                      <span className="text-sm text-muted-foreground">
                        {item["0-1 año"] + item["1-3 años"] + item["3+ años"]}{" "}
                        animales
                      </span>
                    </div>
                    <div className="flex h-4 rounded-md overflow-hidden">
                      <div
                        className="bg-blue-400"
                        style={{
                          width: `${(item["0-1 año"] / (item["0-1 año"] + item["1-3 años"] + item["3+ años"])) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="bg-blue-600"
                        style={{
                          width: `${(item["1-3 años"] / (item["0-1 año"] + item["1-3 años"] + item["3+ años"])) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="bg-blue-800"
                        style={{
                          width: `${(item["3+ años"] / (item["0-1 año"] + item["1-3 años"] + item["3+ años"])) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex text-xs">
                      <div className="flex items-center gap-1 mr-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>0-1 año: {item["0-1 año"]}</span>
                      </div>
                      <div className="flex items-center gap-1 mr-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>1-3 años: {item["1-3 años"]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
                        <span>3+ años: {item["3+ años"]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events and Vaccination Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {upcomingEvents.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay eventos próximos
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="mt-0.5">{getEventIcon(event.type)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <h4 className="font-medium">
                            {event.animalName}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                              ({event.animalTag})
                            </span>
                          </h4>
                          <Badge
                            variant="outline"
                            className={getEventBadgeColor(event.type)}
                          >
                            {event.type === "vaccination"
                              ? "Vacunación"
                              : event.type === "checkup"
                                ? "Revisión"
                                : "Parto"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {formatDate(event.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Estado de Vacunación</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <ScrollArea className="h-[250px] pr-4">
                  {upcomingEvents.filter(
                    (e) =>
                      e.type === "vaccination" &&
                      new Date(e.date) <= new Date(),
                  ).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No hay vacunas pendientes
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents
                        .filter(
                          (e) =>
                            e.type === "vaccination" &&
                            new Date(e.date) <= new Date(),
                        )
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg border bg-red-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  <Syringe className="h-4 w-4 text-red-500" />
                                  {event.animalName}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 hover:bg-red-200"
                              >
                                Atrasada
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {formatDate(event.date)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                <ScrollArea className="h-[250px] pr-4">
                  {upcomingEvents.filter(
                    (e) =>
                      e.type === "vaccination" && new Date(e.date) > new Date(),
                  ).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No hay vacunas programadas próximamente
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents
                        .filter(
                          (e) =>
                            e.type === "vaccination" &&
                            new Date(e.date) > new Date(),
                        )
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg border bg-blue-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  <Syringe className="h-4 w-4 text-blue-500" />
                                  {event.animalName}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                Programada
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {formatDate(event.date)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
