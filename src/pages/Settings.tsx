import { useOutletContext } from "react-router-dom";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon } from "lucide-react";

interface OutletContextType {
  currentWorkspaceId: string | undefined;
}

export default function Settings() {
  const { currentWorkspaceId } = useOutletContext<OutletContextType>();
  const { data: workspaces } = useWorkspaces();
  const { user } = useAuth();

  const currentWorkspace = workspaces?.find((w) => w.id === currentWorkspaceId);

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "U";

  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <SettingsIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground">Please select or create a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and workspace settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.user_metadata?.full_name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  defaultValue={user?.user_metadata?.full_name || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email || ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Current workspace settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                defaultValue={currentWorkspace?.name || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Input
                id="workspace-description"
                defaultValue={currentWorkspace?.description || ""}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
