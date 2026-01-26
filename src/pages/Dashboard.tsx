import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { CreateWorkspaceDialog } from "@/components/CreateWorkspaceDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight 
} from "lucide-react";

interface OutletContextType {
  currentWorkspaceId: string | undefined;
  setCurrentWorkspaceId: (id: string) => void;
}

export default function Dashboard() {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useOutletContext<OutletContextType>();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { data: projects, isLoading: projectsLoading } = useProjects(currentWorkspaceId);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const navigate = useNavigate();

  const hasWorkspaces = workspaces && workspaces.length > 0;

  // If no workspaces, show onboarding
  if (!workspacesLoading && !hasWorkspaces) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-6">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to TaskFlow!</h1>
          <p className="text-muted-foreground mb-6">
            Create your first workspace to start organizing projects and tasks with your team.
          </p>
          <Button onClick={() => setShowCreateWorkspace(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Workspace
          </Button>
        </div>

        <CreateWorkspaceDialog
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
          onSuccess={(workspaceId) => {
            setCurrentWorkspaceId(workspaceId);
            setShowCreateWorkspace(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your workspace projects and tasks
          </p>
        </div>
        {currentWorkspaceId && (
          <Button onClick={() => setShowCreateProject(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={projects?.length || 0}
          icon={FolderKanban}
          description="Active projects"
        />
        <StatsCard
          title="In Progress"
          value={0}
          icon={Clock}
          description="Tasks being worked on"
          className="text-primary"
        />
        <StatsCard
          title="Completed"
          value={0}
          icon={CheckCircle2}
          description="Tasks done this week"
          className="text-green-600"
        />
      </div>

      {/* Projects Grid */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Projects</h2>
      </div>

      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setShowCreateProject(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {currentWorkspaceId && (
        <CreateProjectDialog
          workspaceId={currentWorkspaceId}
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          onSuccess={() => setShowCreateProject(false)}
        />
      )}
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  className 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  description: string;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 text-muted-foreground ${className}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ 
  project, 
  onClick 
}: { 
  project: { id: string; name: string; description: string | null };
  onClick: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {project.description || "No description"}
            </CardDescription>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            0 tasks
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
