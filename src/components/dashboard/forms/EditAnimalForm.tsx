import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const editAnimalFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string(),
  entryDate: z.string(),
  breed: z.string().min(2, "La raza debe tener al menos 2 caracteres"),
  earTag: z.enum(["red", "green", "yellow", "sky"]),
  farm: z.string().min(2, "La finca es requerida"),
});

type EditAnimalFormValues = z.infer<typeof editAnimalFormSchema>;

type EditAnimalFormProps = {
  animalId: string;
  onSuccess?: () => void;
};

export function EditAnimalForm({ animalId, onSuccess }: EditAnimalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<EditAnimalFormValues>({
    resolver: zodResolver(editAnimalFormSchema),
    defaultValues: {
      name: "",
      gender: "male",
      birthDate: "",
      entryDate: "",
      breed: "",
      earTag: "red",
      farm: "",
    },
  });

  useEffect(() => {
    async function fetchAnimal() {
      if (!animalId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("animals")
          .select("*")
          .eq("id", animalId)
          .single();

        if (error) throw error;

        form.reset({
          name: data.name,
          gender: data.gender,
          birthDate: data.birth_date,
          entryDate: data.entry_date,
          breed: data.breed,
          earTag: data.ear_tag,
          farm: data.farm,
        });
      } catch (error) {
        console.error("Error fetching animal:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del animal",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimal();
  }, [animalId, form, toast]);

  async function onSubmit(data: EditAnimalFormValues) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("animals")
        .update({
          name: data.name,
          gender: data.gender,
          birth_date: data.birthDate,
          entry_date: data.entryDate,
          breed: data.breed,
          ear_tag: data.earTag,
          farm: data.farm,
        })
        .eq("id", animalId);

      if (error) throw error;

      toast({
        title: "Animal actualizado",
        description: `${data.name} ha sido actualizado correctamente`,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description:
          error.message || "Ha ocurrido un error al actualizar el animal",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Cargando información...</p>
          </div>
        ) : (
          <>
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

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
