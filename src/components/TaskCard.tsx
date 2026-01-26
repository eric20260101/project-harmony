import { Task, TaskPriority } from "@/hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
  urgent: "priority-urgent",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow bg-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            <Badge variant="secondary" className={cn("text-xs", priorityStyles[task.priority])}>
              {priorityLabels[task.priority]}
            </Badge>

            {/* Due date */}
            {task.due_date && (
              <span className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue && "text-destructive",
                isDueToday && !isOverdue && "text-orange-600"
              )}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
          </div>

          {/* Assignee */}
          {task.assignee_id && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                ?
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
