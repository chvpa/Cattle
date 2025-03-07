import { Header } from "./Header";
import { MetricsGrid } from "./MetricsGrid";
import { CattleTable } from "./CattleTable";
import { Sidebar } from "./Sidebar";
import { Notifications } from "./Notifications";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background max-w-[100vw] overflow-hidden">
      <Header />

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 max-w-full">
          <MetricsGrid />
          <CattleTable />
        </div>
        <Sidebar />
      </div>

      <Notifications />
    </div>
  );
}
