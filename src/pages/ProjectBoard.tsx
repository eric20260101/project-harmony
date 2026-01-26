import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks, Task, TaskStatus, useUpdateTask } from "@/hooks/useTasks";
import { KanbanColumn } from "@/components/KanbanColumn";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailSheet } from "@/components/TaskDetailSheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface OutletContextType {
  currentWorkspaceId: string | undefined;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspaceId } = useOutletContext<OutletContextType>();
  const { data: projects } = useProjects(currentWorkspaceId);
  const { data: tasks } = useTasks(projectId);
  const updateTask = useUpdateTask();
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createInColumn, setCreateInColumn] = useState<TaskStatus>("todo");

  const project = projects?.find(p => p.id === projectId);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    
    tasks?.forEach(task => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [tasks]);

  const handleDragEnd = (taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate({
      taskId,
      updates: { status: newStatus },
    });
  };

  const handleCreateInColumn = (status: TaskStatus) => {
    setCreateInColumn(status);
    setShowCreateTask(true);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Button onClick={() => handleCreateInColumn("todo")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 min-w-max h-full">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.id}
              tasks={tasksByStatus[column.id]}
              onDragEnd={handleDragEnd}
              onTaskClick={setSelectedTask}
              onAddClick={() => handleCreateInColumn(column.id)}
            />
          ))}
        </div>
      </div>

      {/* Create Task Dialog */}
      {projectId && (
        <CreateTaskDialog
          projectId={projectId}
          initialStatus={createInColumn}
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
        />
      )}

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
