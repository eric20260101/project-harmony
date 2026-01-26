import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight, Users, Kanban, BarChart3 } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
          Organize your team's work,{" "}
          <span className="text-primary">effortlessly.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Powerful project management with Kanban boards, real-time collaboration, 
          and detailed analytics. Built for teams that ship.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to manage projects
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Kanban}
            title="Kanban Boards"
            description="Visualize your workflow with drag-and-drop task boards. Move tasks through To Do, In Progress, and Done."
          />
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Invite team members, assign tasks, and collaborate with comments. Everyone stays in sync."
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics & Insights"
            description="Track progress with dashboards showing task counts, team workload, and project health."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2024 TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
