import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Notifications } from "./Notifications";
import { MetricsGrid } from "./MetricsGrid";
import { CattleTable } from "./CattleTable";
import { GeneralDashboard } from "./GeneralDashboard";
import { Reports } from "./Reports";

export default function DashboardLayout() {
  const [activeSection, setActiveSection] = useState<
    "main" | "general" | "reports"
  >("main");

  return (
    <div className="min-h-screen bg-background max-w-[100vw] overflow-hidden">
      <Header
        className="sticky top-0 z-10"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex flex-row h-[calc(100vh-64px)]">
        <Sidebar
          onSectionChange={setActiveSection}
          activeSection={activeSection}
          className="sticky top-16 h-[calc(100vh-64px)] z-10"
        />

        <div className="flex-1 overflow-auto">
          {activeSection === "main" ? (
            <>
              <MetricsGrid />
              <CattleTable />
            </>
          ) : activeSection === "general" ? (
            <GeneralDashboard />
          ) : (
            <Reports />
          )}
        </div>
      </div>

      <Notifications />
    </div>
  );
}
