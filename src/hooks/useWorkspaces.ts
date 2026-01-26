import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useWorkspaces() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workspaces", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !!user,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name, description, created_by: user.id })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({ workspace_id: workspace.id, user_id: user.id });

      if (memberError) throw memberError;

      return workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast({
        title: "Workspace created",
        description: "Your new workspace is ready to use.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workspace",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
