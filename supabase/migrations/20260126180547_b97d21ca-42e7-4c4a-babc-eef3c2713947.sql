-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');

-- Create task priority enum
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create labels table
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_labels junction table
CREATE TABLE public.task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(task_id, label_id)
);

-- Create task attachments table
CREATE TABLE public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- Workspaces policies
CREATE POLICY "Members can view workspaces" ON public.workspaces
  FOR SELECT TO authenticated 
  USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can update workspaces" ON public.workspaces
  FOR UPDATE TO authenticated 
  USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Members can delete workspaces" ON public.workspaces
  FOR DELETE TO authenticated 
  USING (public.is_workspace_member(auth.uid(), id));

-- Workspace members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT TO authenticated 
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can add workspace members" ON public.workspace_members
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can remove workspace members" ON public.workspace_members
  FOR DELETE TO authenticated 
  USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Projects policies
CREATE POLICY "Members can view projects" ON public.projects
  FOR SELECT TO authenticated 
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create projects" ON public.projects
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can update projects" ON public.projects
  FOR UPDATE TO authenticated 
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete projects" ON public.projects
  FOR DELETE TO authenticated 
  USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Labels policies (through project -> workspace)
CREATE POLICY "Members can view labels" ON public.labels
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can create labels" ON public.labels
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can update labels" ON public.labels
  FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can delete labels" ON public.labels
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

-- Tasks policies
CREATE POLICY "Members can view tasks" ON public.tasks
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can create tasks" ON public.tasks
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can update tasks" ON public.tasks
  FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can delete tasks" ON public.tasks
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

-- Task labels policies
CREATE POLICY "Members can view task labels" ON public.task_labels
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can manage task labels" ON public.task_labels
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

-- Task attachments policies
CREATE POLICY "Members can view attachments" ON public.task_attachments
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can add attachments" ON public.task_attachments
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can delete attachments" ON public.task_attachments
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

-- Comments policies
CREATE POLICY "Members can view comments" ON public.comments
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can create comments" ON public.comments
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id
      WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
    )
  );

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Members can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

CREATE POLICY "Members can create activity logs" ON public.activity_logs
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_id AND public.is_workspace_member(auth.uid(), p.workspace_id)
  ));

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

-- Storage policies for task attachments
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'task-attachments');

CREATE POLICY "Users can delete their attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'task-attachments');