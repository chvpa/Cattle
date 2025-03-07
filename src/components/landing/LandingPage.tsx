import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Beef, BarChart2, Shield, Users } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Beef className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Senda</h1>
          </div>
          <Button onClick={() => navigate("/login")} className="px-6">
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Gestión Ganadera Simplificada
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Administra tu ganado de manera eficiente con nuestra plataforma
            integral diseñada para ganaderos.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="px-8 py-6 text-lg"
          >
            Comenzar Ahora
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Control de Ganado</h3>
              <p className="text-muted-foreground">
                Registra y monitorea tu ganado con información detallada sobre
                cada animal.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Vacunas</h3>
              <p className="text-muted-foreground">
                Programa y registra vacunaciones con recordatorios automáticos
                para mantener tu ganado saludable.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Análisis y Reportes
              </h3>
              <p className="text-muted-foreground">
                Visualiza métricas clave y genera reportes para tomar decisiones
                informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <p className="italic mb-4">
                "Senda ha transformado la manera en que administro mi ganado.
                Ahora puedo tener un control preciso de cada animal y sus
                necesidades."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Carlos Rodríguez</p>
                  <p className="text-sm text-muted-foreground">
                    Ganadero, Córdoba
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <p className="italic mb-4">
                "La gestión de vacunas y el sistema de notificaciones me han
                ayudado a mantener mi ganado saludable y a prevenir
                enfermedades."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">María González</p>
                  <p className="text-sm text-muted-foreground">
                    Ganadera, Santa Fe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Comienza a gestionar tu ganado hoy mismo
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Únete a cientos de ganaderos que ya confían en Senda para la gestión
            de su ganado.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            variant="secondary"
            className="px-8 py-6 text-lg"
          >
            Crear una cuenta
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Beef className="h-5 w-5 text-primary" />
              <span className="font-bold">Senda</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Senda. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
