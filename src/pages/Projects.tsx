import { useOutletContext, useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";
import { useState } from "react";

interface OutletContextType {
  currentWorkspaceId: string | undefined;
}

export default function Projects() {
  const { currentWorkspaceId } = useOutletContext<OutletContextType>();
  const { data: projects, isLoading } = useProjects(currentWorkspaceId);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const navigate = useNavigate();

  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground">Please select or create a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your workspace projects</p>
        </div>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
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
            <Card
              key={project.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => navigate(`/projects/${project.id}`)}
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
                <Badge variant="secondary" className="text-xs">
                  0 tasks
                </Badge>
              </CardContent>
            </Card>
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

      <CreateProjectDialog
        workspaceId={currentWorkspaceId}
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onSuccess={() => setShowCreateProject(false)}
      />
    </div>
  );
}
