import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface OutletContextType {
  currentWorkspaceId: string | undefined;
}

interface TeamMember {
  id: string;
  user_id: string;
  joined_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Team() {
  const { currentWorkspaceId } = useOutletContext<OutletContextType>();

  const { data: members, isLoading } = useQuery({
    queryKey: ["workspace-members", currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          user_id,
          joined_at,
          profile:profiles!workspace_members_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq("workspace_id", currentWorkspaceId!);

      if (error) throw error;
      return data as unknown as TeamMember[];
    },
    enabled: !!currentWorkspaceId,
  });

  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground">Please select or create a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage your workspace members</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members && members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const initials = member.profile?.full_name
              ? member.profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
              : member.profile?.email?.[0].toUpperCase() || "U";

            return (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.profile?.full_name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No team members yet</h3>
            <p className="text-sm text-muted-foreground">
              Invite team members to collaborate on projects
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
