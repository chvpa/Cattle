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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const healthFormSchema = z.object({
  animalId: z.string().min(1, "Selecciona un animal"),
  status: z.enum(["healthy", "sick", "pregnant"]),
  dewormingDate: z.string().optional(),
  professional: z.string().optional(),
  medications: z.string().optional(),
  lastVetCheck: z.string().optional(),
  checkupNotes: z.string().optional(),
  notes: z.string().optional(),
});

type HealthFormValues = z.infer<typeof healthFormSchema>;

export function HealthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [animals, setAnimals] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      animalId: "",
      status: "healthy",
      dewormingDate: "",
      professional: "",
      medications: "",
      lastVetCheck: "",
      checkupNotes: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function fetchAnimals() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("animals")
          .select("id, name, tag");

        if (error) throw error;

        setAnimals(
          data.map((animal) => ({
            id: animal.id,
            name: `${animal.name} (${animal.tag})`,
          })),
        );
      } catch (error) {
        console.error("Error fetching animals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los animales",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimals();
  }, [toast]);

  async function onSubmit(data: HealthFormValues) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("animals")
        .update({
          status: data.status,
        })
        .eq("id", data.animalId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `El estado del animal ha sido actualizado correctamente`,
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description:
          error.message || "Ha ocurrido un error al actualizar el estado",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="max-h-[400px] overflow-y-auto pr-2">
          <FormField
            control={form.control}
            name="animalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animal</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar animal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado de Salud</FormLabel>
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

          <FormField
            control={form.control}
            name="dewormingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Última fecha de desparasitación</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="professional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profesional</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamentos utilizados</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ivermectina, Albendazol, etc."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastVetCheck"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Última revisión veterinaria</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkupNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios de la revisión</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones del veterinario durante la última revisión"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales sobre el estado de salud"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar Estado"}
        </Button>
      </form>
    </Form>
  );
}
