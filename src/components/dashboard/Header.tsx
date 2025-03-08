import { Button } from "@/components/ui/button";
import { PlusCircle, Menu } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalForm } from "./forms/AnimalForm";
import { VaccineForm } from "./forms/VaccineForm";
import { HealthForm } from "./forms/HealthForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type HeaderProps = {
  className?: string;
};

export function Header({ className = "" }: HeaderProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b bg-card ${className}`}
    >
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <div className="py-4 space-y-4">
              <h2 className="text-lg font-semibold">Menú</h2>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  Vista General
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  Control
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  Ajustes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl md:text-2xl font-bold">Senda</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir Datos</span>
              <span className="sm:hidden">Añadir</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>Añadir Datos</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="animal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="animal">Nuevo Animal</TabsTrigger>
                <TabsTrigger value="vaccine">Nueva Vacuna</TabsTrigger>
                <TabsTrigger value="health">Salud</TabsTrigger>
              </TabsList>
              <TabsContent value="animal">
                <AnimalForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
              <TabsContent value="vaccine">
                <VaccineForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
              <TabsContent value="health">
                <HealthForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <UserMenu />
      </div>
    </div>
  );
}
