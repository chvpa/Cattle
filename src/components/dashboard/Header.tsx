import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Menu,
  LayoutDashboard,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";
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
import { ReproductionForm } from "./forms/ReproductionForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type HeaderProps = {
  className?: string;
  activeSection?: "main" | "general" | "reports";
  onSectionChange?: (section: "main" | "general" | "reports") => void;
};

export function Header({
  className = "",
  activeSection = "main",
  onSectionChange = () => {},
}: HeaderProps) {
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
          <SheetContent
            side="left"
            className="w-[240px] sm:w-[280px]"
            onCloseAutoFocus={() =>
              document.querySelector("[data-radix-sheet-close]")?.click()
            }
          >
            <div className="py-4 space-y-4">
              <h2 className="text-lg font-semibold">Menú</h2>
              <div className="space-y-2">
                <Button
                  variant={activeSection === "general" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onSectionChange("general");
                    document.querySelector("[data-radix-sheet-close]")?.click();
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Vista General
                </Button>
                <Button
                  variant={activeSection === "main" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onSectionChange("main");
                    document.querySelector("[data-radix-sheet-close]")?.click();
                  }}
                >
                  <ClipboardList className="h-4 w-4" />
                  Control
                </Button>
                <Button
                  variant={activeSection === "reports" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onSectionChange("reports");
                    document.querySelector("[data-radix-sheet-close]")?.click();
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Reportes
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Ajustes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl md:text-2xl font-bold">Cattle</h1>
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
          <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-auto overflow-hidden p-0">
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle>Añadir Datos</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="animal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 overflow-x-auto">
                <TabsTrigger value="animal" className="whitespace-nowrap">
                  Nuevo Animal
                </TabsTrigger>
                <TabsTrigger value="vaccine" className="whitespace-nowrap">
                  Vacuna
                </TabsTrigger>
                <TabsTrigger value="health" className="whitespace-nowrap">
                  Salud
                </TabsTrigger>
                <TabsTrigger value="reproduction" className="whitespace-nowrap">
                  Reproducción
                </TabsTrigger>
              </TabsList>
              <TabsContent value="animal" className="p-0">
                <AnimalForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
              <TabsContent value="vaccine" className="p-0">
                <VaccineForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
              <TabsContent value="health" className="p-0">
                <HealthForm
                  onSuccess={() =>
                    document.querySelector("[data-radix-dialog-close]")?.click()
                  }
                />
              </TabsContent>
              <TabsContent value="reproduction" className="p-0">
                <ReproductionForm
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
