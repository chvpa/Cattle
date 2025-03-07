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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";

const vaccineFormSchema = z.object({
  animalId: z.string().min(1, "Selecciona un animal"),
  vaccineType: z.string().min(2, "El tipo de vacuna es requerido"),
  date: z.string(),
  nextDate: z.string().optional(),
  notes: z.string().optional(),
});

type VaccineFormValues = z.infer<typeof vaccineFormSchema>;

export function VaccineForm({ onSuccess }: { onSuccess?: () => void }) {
  const [animals, setAnimals] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAnimals() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("animals")
          .select("id, name, tag")
          .eq("user_id", user.id);

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
  }, [user, toast]);

  const form = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineFormSchema),
    defaultValues: {
      animalId: "",
      vaccineType: "",
      date: new Date().toISOString().split("T")[0],
      nextDate: "",
      notes: "",
    },
  });

  async function onSubmit(data: VaccineFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para registrar una vacuna",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("vaccines").insert({
        animal_id: data.animalId,
        vaccine_type: data.vaccineType,
        date: data.date,
        next_date: data.nextDate || null,
        notes: data.notes || null,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Vacuna registrada",
        description: `La vacuna ha sido registrada correctamente`,
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description:
          error.message || "Ha ocurrido un error al registrar la vacuna",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="animalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="vaccineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Vacuna</FormLabel>
              <FormControl>
                <Input placeholder="Fiebre Aftosa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Aplicación</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próxima Aplicación</FormLabel>
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones adicionales sobre la vacunación"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Registrando..." : "Registrar Vacuna"}
        </Button>
      </form>
    </Form>
  );
}
