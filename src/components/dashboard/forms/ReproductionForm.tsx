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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { addDays, format } from "date-fns";

const reproductionFormSchema = z.object({
  motherId: z.string().min(1, "Selecciona una madre"),
  fatherId: z.string().min(1, "Selecciona un padre"),
  serviceMethod: z.enum(["natural", "artificial"]),
  serviceDate: z.string(),
  expectedBirthDate: z.string(),
});

type ReproductionFormValues = z.infer<typeof reproductionFormSchema>;

export function ReproductionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mothers, setMothers] = useState<{ id: string; name: string }[]>([]);
  const [fathers, setFathers] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ReproductionFormValues>({
    resolver: zodResolver(reproductionFormSchema),
    defaultValues: {
      motherId: "",
      fatherId: "",
      serviceMethod: "natural",
      serviceDate: new Date().toISOString().split("T")[0],
      expectedBirthDate: addDays(new Date(), 278).toISOString().split("T")[0],
    },
  });

  // Watch the service date to update the expected birth date
  const serviceDate = form.watch("serviceDate");

  useEffect(() => {
    if (serviceDate) {
      const date = new Date(serviceDate);
      const expectedDate = addDays(date, 278);
      form.setValue(
        "expectedBirthDate",
        expectedDate.toISOString().split("T")[0],
      );
    }
  }, [serviceDate, form]);

  useEffect(() => {
    async function fetchAnimals() {
      if (!user) return;

      try {
        setIsLoading(true);
        // Fetch female animals for mothers
        const { data: femaleData, error: femaleError } = await supabase
          .from("animals")
          .select("id, name, tag")
          .eq("user_id", user.id)
          .eq("gender", "female");

        if (femaleError) throw femaleError;

        // Fetch male animals for fathers
        const { data: maleData, error: maleError } = await supabase
          .from("animals")
          .select("id, name, tag")
          .eq("user_id", user.id)
          .eq("gender", "male");

        if (maleError) throw maleError;

        setMothers(
          femaleData.map((animal) => ({
            id: animal.id,
            name: `${animal.name} (${animal.tag})`,
          })),
        );

        setFathers(
          maleData.map((animal) => ({
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

  async function onSubmit(data: ReproductionFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para registrar una reproducción",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reproductions").insert({
        mother_id: data.motherId,
        father_id: data.fatherId,
        service_method: data.serviceMethod,
        service_date: data.serviceDate,
        expected_birth_date: data.expectedBirthDate,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Reproducción registrada",
        description: `La reproducción ha sido registrada correctamente`,
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description:
          error.message || "Ha ocurrido un error al registrar la reproducción",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <ScrollArea className="h-[400px] px-2 py-2">
          <h2 className="text-xl font-semibold mb-4">Nueva Reproducción</h2>

          <FormField
            control={form.control}
            name="motherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vaca/Vaquilla</FormLabel>
                <FormControl>
                  <Combobox
                    options={mothers.map((animal) => ({
                      value: animal.id,
                      label: animal.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar vaca/vaquilla"
                    searchPlaceholder="Buscar vaca/vaquilla por nombre o tag..."
                    emptyMessage="No se encontraron vacas/vaquillas"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toro</FormLabel>
                <FormControl>
                  <Combobox
                    options={fathers.map((animal) => ({
                      value: animal.id,
                      label: animal.name,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar toro"
                    searchPlaceholder="Buscar toro por nombre o tag..."
                    emptyMessage="No se encontraron toros"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceMethod"
            render={({ field }) => (
              <FormItem className="space-y-3 mb-4">
                <FormLabel>Método de Servicio</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-3"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="natural" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Montada Natural
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="artificial" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Inseminación Artificial
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
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Servicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedBirthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Parto Aproximado</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled className="bg-muted" />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado automáticamente (278 días después del servicio)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full mt-8"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Registrando..." : "Registrar Reproducción"}
          </Button>
        </ScrollArea>
      </form>
    </Form>
  );
}
