import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";

const animalFormSchema = z.object({
  tag: z.string().min(3, "El tag debe tener al menos 3 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string(),
  entryDate: z.string(),
  breed: z.string().min(2, "La raza debe tener al menos 2 caracteres"),
  status: z.enum(["healthy", "sick", "pregnant"]),
  earTag: z.enum(["red", "green", "yellow", "sky"]),
  weight: z.string().min(1, "El peso es requerido"),
  owner: z.string().min(2, "El propietario es requerido"),
  purpose: z.enum(["fattening", "breeding", "sale"]),
  farm: z.string().min(2, "La finca es requerida"),
  category: z.enum([
    "vaca",
    "vaquilla",
    "novillo",
    "toro",
    "desmamante_macho",
    "desmamante_hembra",
    "ternero",
    "bueye",
  ]),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export function AnimalForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      tag: "",
      name: "",
      gender: "male",
      birthDate: new Date().toISOString().split("T")[0],
      entryDate: new Date().toISOString().split("T")[0],
      breed: "",
      status: "healthy",
      earTag: "red",
      weight: "",
      owner: "",
      purpose: "fattening",
      farm: "",
      category: "vaca",
    },
  });

  async function onSubmit(data: AnimalFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para registrar un animal",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Make sure we're inserting with the current user's ID
      const { error } = await supabase.from("animals").insert({
        tag: data.tag,
        name: data.name,
        gender: data.gender,
        birth_date: data.birthDate,
        entry_date: data.entryDate,
        breed: data.breed,
        status: data.status,
        ear_tag: data.earTag,
        weight: data.weight,
        owner: data.owner,
        purpose: data.purpose,
        farm: data.farm,
        category: data.category,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Animal registrado",
        description: `${data.name} ha sido registrado correctamente`,
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description:
          error.message || "Ha ocurrido un error al registrar el animal",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <ScrollArea className="h-[400px] pr-4">
          <h2 className="text-xl font-semibold mb-4">Nuevo Animal</h2>

          <FormField
            control={form.control}
            name="earTag"
            render={({ field }) => (
              <FormItem className="space-y-3 mb-4">
                <FormLabel>Caravana</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-3"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="red"
                          className="bg-red-500 border-red-500"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Roja
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="green"
                          className="bg-green-500 border-green-500"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Verde
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="yellow"
                          className="bg-yellow-500 border-yellow-500"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Amarilla
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="sky"
                          className="bg-sky-500 border-sky-500"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Celeste
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input placeholder="SND-001" {...field} />
                </FormControl>
                <FormDescription>
                  Identificador único del animal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Aurora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Macho</SelectItem>
                      <SelectItem value="female">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="entryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Ingreso</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raza</FormLabel>
                  <FormControl>
                    <Input placeholder="Holstein" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="healthy">Saludable</SelectItem>
                      <SelectItem value="sick">Enfermo</SelectItem>
                      <SelectItem value="pregnant">Preñada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propietario</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar propósito" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fattening">Engorde</SelectItem>
                      <SelectItem value="breeding">Cría</SelectItem>
                      <SelectItem value="sale">Venta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="farm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Finca</FormLabel>
                <FormControl>
                  <Input placeholder="El Paraíso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vaca">Vaca</SelectItem>
                    <SelectItem value="vaquilla">Vaquilla</SelectItem>
                    <SelectItem value="novillo">Novillo</SelectItem>
                    <SelectItem value="toro">Toro</SelectItem>
                    <SelectItem value="desmamante_macho">
                      Desmamante Macho
                    </SelectItem>
                    <SelectItem value="desmamante_hembra">
                      Desmamante Hembra
                    </SelectItem>
                    <SelectItem value="ternero">Ternero</SelectItem>
                    <SelectItem value="bueye">Bueye</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Animal"}
          </Button>
        </ScrollArea>
      </form>
    </Form>
  );
}
