import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { CreateWorkspaceDialog } from "@/components/CreateWorkspaceDialog";

export function AppLayout() {
  const { data: workspaces } = useWorkspaces();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | undefined>();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  // Set initial workspace
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspaceId) {
      setCurrentWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, currentWorkspaceId]);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        currentWorkspaceId={currentWorkspaceId}
        onWorkspaceChange={setCurrentWorkspaceId}
        onCreateWorkspace={() => setShowCreateWorkspace(true)}
      />
      <main className="flex-1 overflow-auto">
        <Outlet context={{ currentWorkspaceId, setCurrentWorkspaceId }} />
      </main>

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
