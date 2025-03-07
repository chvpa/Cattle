import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Syringe, Info, Tag } from "lucide-react";

type AnimalCardProps = {
  animalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Animal = {
  id: string;
  tag: string;
  name: string;
  gender: string;
  birthDate: string;
  entryDate: string;
  breed: string;
  status: string;
  earTag: string;
  createdAt: string;
};

type Vaccine = {
  id: string;
  vaccineType: string;
  date: string;
  nextDate: string | null;
  notes: string | null;
};

export function AnimalCard({ animalId, open, onOpenChange }: AnimalCardProps) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimalData() {
      if (!animalId || !open) return;

      try {
        setIsLoading(true);
        // Fetch animal details
        const { data: animalData, error: animalError } = await supabase
          .from("animals")
          .select("*")
          .eq("id", animalId)
          .single();

        if (animalError) throw animalError;

        setAnimal({
          id: animalData.id,
          tag: animalData.tag,
          name: animalData.name,
          gender: animalData.gender,
          birthDate: animalData.birth_date,
          entryDate: animalData.entry_date,
          breed: animalData.breed,
          status: animalData.status,
          earTag: animalData.ear_tag,
          createdAt: animalData.created_at,
        });

        // Fetch vaccines for this animal
        const { data: vaccineData, error: vaccineError } = await supabase
          .from("vaccines")
          .select("*")
          .eq("animal_id", animalId)
          .order("date", { ascending: false });

        if (vaccineError) throw vaccineError;

        setVaccines(
          vaccineData.map((v) => ({
            id: v.id,
            vaccineType: v.vaccine_type,
            date: v.date,
            nextDate: v.next_date,
            notes: v.notes,
          })),
        );
      } catch (error) {
        console.error("Error fetching animal data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimalData();
  }, [animalId, open]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
    }

    return years === 0
      ? `${Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`
      : `${years} años`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Saludable";
      case "sick":
        return "Enfermo";
      case "pregnant":
        return "Preñada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "sick":
        return "bg-red-100 text-red-800";
      case "pregnant":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEarTagColor = (earTag: string) => {
    switch (earTag) {
      case "red":
        return "bg-red-500";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "sky":
        return "bg-sky-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEarTagName = (earTag: string) => {
    switch (earTag) {
      case "red":
        return "Roja";
      case "green":
        return "Verde";
      case "yellow":
        return "Amarilla";
      case "sky":
        return "Celeste";
      default:
        return earTag;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] w-[95vw] max-w-[95vw] sm:w-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Carnet de {animal?.name || "Animal"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Cargando información...</p>
          </div>
        ) : animal ? (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                Información
              </TabsTrigger>
              <TabsTrigger value="vaccines" className="flex items-center gap-1">
                <Syringe className="h-4 w-4" />
                Vacunas ({vaccines.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {animal.name}
                    <Badge className="ml-2">{animal.tag}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Registrado el {formatDate(animal.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Género</p>
                      <p>{animal.gender === "male" ? "Macho" : "Hembra"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Estado</p>
                      <p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                            animal.status,
                          )}`}
                        >
                          {getStatusText(animal.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Fecha de nacimiento</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(animal.birthDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Edad</p>
                      <p>{calculateAge(animal.birthDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Fecha de ingreso</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(animal.entryDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Caravana</p>
                      <p className="flex items-center gap-1">
                        <span
                          className={`h-3 w-3 rounded-full ${getEarTagColor(animal.earTag)}`}
                        ></span>
                        {getEarTagName(animal.earTag)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Raza</p>
                    <p>{animal.breed}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccines" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Historial de vacunas
                  </CardTitle>
                  <CardDescription>
                    Registro de vacunaciones de {animal.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    {vaccines.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay vacunas registradas para este animal
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {vaccines.map((vaccine) => (
                          <div key={vaccine.id} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">
                                  {vaccine.vaccineType}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Aplicada: {formatDate(vaccine.date)}
                                </p>
                              </div>
                              {vaccine.nextDate && (
                                <Badge variant="outline" className="ml-2">
                                  Próxima: {formatDate(vaccine.nextDate)}
                                </Badge>
                              )}
                            </div>
                            {vaccine.notes && (
                              <p className="text-sm bg-muted p-2 rounded-md">
                                {vaccine.notes}
                              </p>
                            )}
                            <Separator className="my-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p>No se encontró información del animal</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
