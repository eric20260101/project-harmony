import { Task, TaskStatus } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDragEnd: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onAddClick: () => void;
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground",
  in_progress: "bg-primary",
  done: "bg-green-500",
};

export function KanbanColumn({ 
  title, 
  status, 
  tasks, 
  onDragEnd, 
  onTaskClick,
  onAddClick 
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-primary/50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary/50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-primary/50");
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDragEnd(taskId, status);
    }
  };

  return (
    <div
      className="flex flex-col w-80 bg-muted/30 rounded-lg"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", statusColors[status])} />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddClick}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="flex-1 px-3 pb-3 space-y-3 overflow-y-auto min-h-[400px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
