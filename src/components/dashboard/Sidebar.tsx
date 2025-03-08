import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  FileText,
} from "lucide-react";

type SidebarProps = {
  activeSection: "main" | "general" | "reports";
  onSectionChange: (section: "main" | "general" | "reports") => void;
  className?: string;
};

export function Sidebar({
  activeSection,
  onSectionChange,
  className = "",
}: SidebarProps) {
  // No state needed for simplified sidebar

  return (
    <div className={`w-64 border-r bg-card hidden md:block ${className}`}>
      <div className="p-4 space-y-4">
        <nav className="space-y-2">
          <Button
            variant={activeSection === "general" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => onSectionChange("general")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Vista General
          </Button>
          <Button
            variant={activeSection === "main" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => onSectionChange("main")}
          >
            <ClipboardList className="h-4 w-4" />
            Control
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Ajustes
          </Button>
        </nav>

        <Separator />

        <Button
          variant={activeSection === "reports" ? "default" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => onSectionChange("reports")}
        >
          <FileText className="h-4 w-4" />
          Reportes
        </Button>
      </div>
    </div>
  );
}
