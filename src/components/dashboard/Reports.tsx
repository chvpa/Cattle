import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Printer,
  RefreshCcw,
  Syringe,
  Users,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import "jspdf-autotable";

type Activity = {
  id: string;
  type: "animal" | "vaccine";
  description: string;
  time: string;
  date: Date;
  details: any;
};

type ReportFilter = {
  dateRange: "today" | "week" | "month" | "all";
  type: "all" | "animal" | "vaccine";
};

export function Reports() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReportFilter>({
    dateRange: "week",
    type: "all",
  });
  const { user } = useAuth();

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return;

      try {
        setIsLoading(true);

        // Calculate date filter
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        let startDate = new Date();

        switch (filter.dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate = subDays(today, 7);
            break;
          case "month":
            startDate = subDays(today, 30);
            break;
          case "all":
            startDate = new Date(0); // Beginning of time
            break;
        }

        // Fetch animals based on date filter
        let animalQuery = supabase
          .from("animals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (filter.dateRange !== "all") {
          animalQuery = animalQuery.gte("created_at", startDate.toISOString());
        }

        const { data: animals, error: animalsError } = await animalQuery;

        if (animalsError) throw animalsError;

        // Fetch vaccines based on date filter
        let vaccineQuery = supabase
          .from("vaccines")
          .select("*, animals(name, tag)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (filter.dateRange !== "all") {
          vaccineQuery = vaccineQuery.gte(
            "created_at",
            startDate.toISOString(),
          );
        }

        const { data: vaccines, error: vaccinesError } = await vaccineQuery;

        if (vaccinesError) throw vaccinesError;

        // Transform to activities
        let allActivities: Activity[] = [];

        if (filter.type === "all" || filter.type === "animal") {
          const animalActivities = (animals || []).map((animal) => ({
            id: `animal-${animal.id}`,
            type: "animal" as const,
            description: `Nuevo animal registrado: ${animal.name} (${animal.tag})`,
            time: formatDate(animal.created_at),
            date: new Date(animal.created_at),
            details: animal,
          }));
          allActivities = [...allActivities, ...animalActivities];
        }

        if (filter.type === "all" || filter.type === "vaccine") {
          const vaccineActivities = (vaccines || []).map((vaccine: any) => ({
            id: `vaccine-${vaccine.id}`,
            type: "vaccine" as const,
            description: `Vacuna ${vaccine.vaccine_type} aplicada: ${vaccine.animals.name}`,
            time: formatDate(vaccine.created_at),
            date: new Date(vaccine.created_at),
            details: vaccine,
          }));
          allActivities = [...allActivities, ...vaccineActivities];
        }

        // Sort by date
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

        setActivities(allActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, [user, filter]);

  // Format date in Spanish
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", {
      locale: es,
    });
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vaccine":
        return <Syringe className="h-4 w-4 text-blue-500" />;
      case "animal":
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "vaccine":
        return "bg-blue-100 text-blue-800";
      case "animal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generatePDF = () => {
    try {
      // Create a simple PDF with basic table
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Reporte de Actividades - Senda", 14, 22);

      // Add date
      doc.setFontSize(11);
      doc.text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);

      // Add filter info
      doc.text(
        `Periodo: ${
          filter.dateRange === "today"
            ? "Hoy"
            : filter.dateRange === "week"
              ? "Última semana"
              : filter.dateRange === "month"
                ? "Último mes"
                : "Todo"
        }`,
        14,
        38,
      );

      doc.text(
        `Tipo: ${
          filter.type === "all"
            ? "Todos"
            : filter.type === "animal"
              ? "Animales"
              : "Vacunas"
        }`,
        14,
        46,
      );

      // Create simple table data
      const tableData = [];

      // Add header row
      tableData.push(["Fecha", "Tipo", "Descripción"]);

      // Add data rows
      activities.forEach((activity) => {
        tableData.push([
          format(activity.date, "dd/MM/yyyy"),
          activity.type === "animal" ? "Animal" : "Vacuna",
          activity.description,
        ]);
      });

      // Draw table manually
      const startY = 55;
      const cellPadding = 5;
      const lineHeight = 10;
      const colWidths = [30, 25, 130];

      // Draw table header
      doc.setFillColor(220, 220, 220);
      doc.setDrawColor(0);
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      let y = startY;

      // Draw header row
      doc.rect(
        14,
        y,
        colWidths[0] + colWidths[1] + colWidths[2],
        lineHeight,
        "FD",
      );
      doc.text(tableData[0][0], 14 + cellPadding, y + lineHeight - cellPadding);
      doc.text(
        tableData[0][1],
        14 + colWidths[0] + cellPadding,
        y + lineHeight - cellPadding,
      );
      doc.text(
        tableData[0][2],
        14 + colWidths[0] + colWidths[1] + cellPadding,
        y + lineHeight - cellPadding,
      );

      // Draw data rows
      doc.setFont("helvetica", "normal");
      y += lineHeight;

      for (let i = 1; i < tableData.length && i < 20; i++) {
        // Limit to 20 rows
        // Draw row background
        doc.setFillColor(255, 255, 255);
        doc.rect(
          14,
          y,
          colWidths[0] + colWidths[1] + colWidths[2],
          lineHeight,
          "FD",
        );

        // Draw cell text
        doc.text(
          tableData[i][0],
          14 + cellPadding,
          y + lineHeight - cellPadding,
        );
        doc.text(
          tableData[i][1],
          14 + colWidths[0] + cellPadding,
          y + lineHeight - cellPadding,
        );
        doc.text(
          tableData[i][2],
          14 + colWidths[0] + colWidths[1] + cellPadding,
          y + lineHeight - cellPadding,
        );

        y += lineHeight;
      }

      // Add summary
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`Total registros: ${activities.length}`, 14, y);
      y += 10;
      doc.text(
        `Animales: ${activities.filter((a) => a.type === "animal").length}`,
        14,
        y,
      );
      y += 10;
      doc.text(
        `Vacunas: ${activities.filter((a) => a.type === "vaccine").length}`,
        14,
        y,
      );

      // Save the PDF
      doc.save(`reporte-senda-${format(new Date(), "yyyyMMdd")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, intente de nuevo.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-bold">Reportes y Actividad</h2>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.dateRange}
            onValueChange={(value) =>
              setFilter({ ...filter, dateRange: value as any })
            }
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Periodo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.type}
            onValueChange={(value) =>
              setFilter({ ...filter, type: value as any })
            }
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="animal">Animales</SelectItem>
              <SelectItem value="vaccine">Vacunas</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={generatePDF}
              title="Generar PDF"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={generatePDF}
              title="Descargar reporte"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
              title="Imprimir página"
            >
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

      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p>Cargando actividades...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                No hay actividades para mostrar con los filtros seleccionados
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 border rounded-lg bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <h4 className="font-medium">
                            {activity.description}
                          </h4>
                          <Badge
                            variant="outline"
                            className={getActivityBadgeColor(activity.type)}
                          >
                            {activity.type === "animal" ? "Animal" : "Vacuna"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                        </div>

                        {activity.type === "animal" && (
                          <div className="mt-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Tag:</span>{" "}
                                {activity.details.tag}
                              </div>
                              <div>
                                <span className="font-medium">Género:</span>{" "}
                                {activity.details.gender === "male"
                                  ? "Macho"
                                  : "Hembra"}
                              </div>
                              <div>
                                <span className="font-medium">Raza:</span>{" "}
                                {activity.details.breed}
                              </div>
                              <div>
                                <span className="font-medium">Estado:</span>{" "}
                                {activity.details.status === "healthy"
                                  ? "Saludable"
                                  : activity.details.status === "sick"
                                    ? "Enfermo"
                                    : "Preñada"}
                              </div>
                            </div>
                          </div>
                        )}

                        {activity.type === "vaccine" && (
                          <div className="mt-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Tipo:</span>{" "}
                                {activity.details.vaccine_type}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Fecha aplicación:
                                </span>{" "}
                                {format(
                                  new Date(activity.details.date),
                                  "dd/MM/yyyy",
                                )}
                              </div>
                              {activity.details.next_date && (
                                <div>
                                  <span className="font-medium">
                                    Próxima dosis:
                                  </span>{" "}
                                  {format(
                                    new Date(activity.details.next_date),
                                    "dd/MM/yyyy",
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium text-lg">Total Registros</h3>
              <p className="text-3xl font-bold mt-2">{activities.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                En el periodo seleccionado
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <h3 className="font-medium text-lg">Animales Registrados</h3>
              <p className="text-3xl font-bold mt-2">
                {activities.filter((a) => a.type === "animal").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Nuevos ingresos al sistema
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50">
              <h3 className="font-medium text-lg">Vacunas Aplicadas</h3>
              <p className="text-3xl font-bold mt-2">
                {activities.filter((a) => a.type === "vaccine").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Registros de vacunación
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
