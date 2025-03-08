import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  FileText,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimalCard } from "./AnimalCard";
import { EditAnimalForm } from "./forms/EditAnimalForm";

type Cattle = {
  id: string;
  tag: string;
  name: string;
  gender: "male" | "female";
  birthDate: string;
  entryDate: string;
  breed: string;
  status: string;
  earTag: string;
  owner: string;
};

export function CattleTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isAnimalCardOpen, setIsAnimalCardOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCattle() {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("animals")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        setCattle(
          data.map((animal) => ({
            id: animal.id,
            tag: animal.tag,
            name: animal.name,
            gender: animal.gender,
            birthDate: animal.birth_date,
            entryDate: animal.entry_date,
            breed: animal.breed,
            status:
              animal.status.charAt(0).toUpperCase() + animal.status.slice(1),
            earTag: animal.ear_tag,
            owner: animal.owner || "-",
          })),
        );
      } catch (error) {
        console.error("Error fetching cattle:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del ganado",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCattle();
  }, [user, toast]);

  const filteredCattle = cattle.filter((animal) => {
    // First apply search term filter
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());

    // Then apply column filter if active
    if (!matchesSearch) return false;
    if (!filterColumn || !filterValue) return true;

    switch (filterColumn) {
      case "tag":
        return animal.tag.toLowerCase().includes(filterValue.toLowerCase());
      case "name":
        return animal.name.toLowerCase().includes(filterValue.toLowerCase());
      case "gender":
        return (
          animal.gender.toLowerCase() === filterValue.toLowerCase() ||
          (animal.gender === "male" && filterValue.toLowerCase() === "macho") ||
          (animal.gender === "female" && filterValue.toLowerCase() === "hembra")
        );
      case "birthDate":
        return animal.birthDate.includes(filterValue);
      case "entryDate":
        return animal.entryDate.includes(filterValue);
      case "breed":
        return animal.breed.toLowerCase().includes(filterValue.toLowerCase());
      case "earTag":
        return (
          animal.earTag.toLowerCase().includes(filterValue.toLowerCase()) ||
          (animal.earTag === "red" && filterValue.toLowerCase() === "roja") ||
          (animal.earTag === "green" &&
            filterValue.toLowerCase() === "verde") ||
          (animal.earTag === "yellow" &&
            filterValue.toLowerCase() === "amarilla") ||
          (animal.earTag === "sky" && filterValue.toLowerCase() === "celeste")
        );
      case "status":
        return (
          animal.status.toLowerCase().includes(filterValue.toLowerCase()) ||
          (animal.status === "Healthy" &&
            filterValue.toLowerCase() === "saludable") ||
          (animal.status === "Pregnant" &&
            filterValue.toLowerCase() === "preñada") ||
          (animal.status === "Sick" && filterValue.toLowerCase() === "enfermo")
        );
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold">Registro de Ganado</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={filterColumn || "none"}
              onValueChange={(value) =>
                setFilterColumn(value === "none" ? null : value)
              }
            >
              <SelectTrigger className="w-[130px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin filtro</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="gender">Género</SelectItem>
                <SelectItem value="birthDate">Fecha Nacimiento</SelectItem>
                <SelectItem value="entryDate">Fecha Ingreso</SelectItem>
                <SelectItem value="breed">Raza</SelectItem>
                <SelectItem value="earTag">Caravana</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
              </SelectContent>
            </Select>
            {filterColumn && (
              <Input
                placeholder="Valor del filtro"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full sm:w-[180px]"
              />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-auto max-w-[calc(100vw-2rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Tag</TableHead>
              <TableHead className="whitespace-nowrap">Nombre</TableHead>
              <TableHead className="whitespace-nowrap">Género</TableHead>
              <TableHead className="whitespace-nowrap">
                Fecha Nacimiento
              </TableHead>
              <TableHead className="whitespace-nowrap">Fecha Ingreso</TableHead>
              <TableHead className="whitespace-nowrap">Raza</TableHead>
              <TableHead className="whitespace-nowrap">Propietario</TableHead>
              <TableHead className="whitespace-nowrap">Caravana</TableHead>
              <TableHead className="whitespace-nowrap">Estado</TableHead>
              <TableHead className="w-[80px] whitespace-nowrap">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center h-24 text-muted-foreground"
                >
                  Cargando datos...
                </TableCell>
              </TableRow>
            ) : filteredCattle.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center h-24 text-muted-foreground"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              filteredCattle.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="whitespace-nowrap">
                    {animal.tag}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {animal.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {animal.gender === "male" ? "Macho" : "Hembra"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(animal.birthDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(animal.entryDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {animal.breed}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {animal.owner}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`h-3 w-3 rounded-full mr-2 ${getEarTagColor(animal.earTag)}`}
                      ></span>
                      {getEarTagName(animal.earTag)}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        animal.status === "Healthy"
                          ? "bg-green-100 text-green-800"
                          : animal.status === "Pregnant"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {animal.status === "Healthy"
                        ? "Saludable"
                        : animal.status === "Pregnant"
                          ? "Preñada"
                          : "Enfermo"}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => {
                            setSelectedAnimalId(animal.id);
                            setIsAnimalCardOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4" /> Ver Carnet
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => {
                            setSelectedAnimalId(animal.id);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[95vw] max-w-[95vw] sm:w-auto sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás seguro?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará
                                permanentemente el registro de {animal.name} de
                                la base de datos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from("animals")
                                      .delete()
                                      .eq("id", animal.id);

                                    if (error) throw error;

                                    setCattle(
                                      cattle.filter((c) => c.id !== animal.id),
                                    );
                                    toast({
                                      title: "Animal eliminado",
                                      description: `${animal.name} ha sido eliminado correctamente`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      variant: "destructive",
                                      title: "Error al eliminar",
                                      description:
                                        error.message ||
                                        "Ha ocurrido un error al eliminar el animal",
                                    });
                                  }
                                }}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Animal Card Dialog */}
      {selectedAnimalId && (
        <AnimalCard
          animalId={selectedAnimalId}
          open={isAnimalCardOpen}
          onOpenChange={setIsAnimalCardOpen}
        />
      )}

      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal</DialogTitle>
          </DialogHeader>
          {selectedAnimalId && (
            <EditAnimalForm
              animalId={selectedAnimalId}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                // Refresh the table
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
