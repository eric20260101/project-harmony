import { useState } from "react";
import { Task, TaskPriority, TaskStatus, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Calendar, Flag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
  urgent: "priority-urgent",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  if (!task) return null;

  const handleStartEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateTask.mutate({
      taskId: task.id,
      updates: {
        title: editedTitle,
        description: editedDescription || null,
      },
    });
    setIsEditing(false);
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({
      taskId: task.id,
      updates: { status },
    });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask.mutate({
      taskId: task.id,
      updates: { priority },
    });
  };

  const handleDelete = () => {
    deleteTask.mutate({ taskId: task.id, projectId: task.project_id });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-lg font-semibold"
              />
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={updateTask.isPending}>
                  {updateTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <SheetTitle 
                className="text-xl cursor-pointer hover:text-primary transition-colors"
                onClick={handleStartEdit}
              >
                {task.title}
              </SheetTitle>
              <SheetDescription 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={handleStartEdit}
              >
                {task.description || "Click to add a description..."}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        {/* Properties */}
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Status</Label>
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Priority</Label>
            <Select value={task.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Due Date</Label>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {task.due_date 
                ? format(new Date(task.due_date), "MMM d, yyyy")
                : "No due date"
              }
            </div>
          </div>

          {/* Created */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Created</Label>
            <span className="text-sm">
              {format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task
                  and all its comments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
