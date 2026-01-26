

# Task Management App Plan

## Overview
A professional, Jira-inspired task management platform where teams can create workspaces, manage projects with Kanban boards, and collaborate through comments and activity tracking.

---

## Core Features

### 1. Authentication & User Management
- Email/password sign up and sign in
- User profile with avatar, name, and email
- Secure session management

### 2. Team Workspaces
- Create and name team workspaces
- Invite team members via email
- View all workspace members
- Equal access for all members (no role hierarchy)

### 3. Projects
- Create projects within a workspace
- Project name and description
- Project-level dashboard showing task stats

### 4. Kanban Task Board
Organize tasks across three columns:
- **To Do** – Tasks waiting to be started
- **In Progress** – Active tasks
- **Done** – Completed tasks

Drag-and-drop to move tasks between columns.

### 5. Tasks
Each task includes:
- Title and description
- Assignee (team member)
- Due date
- Priority (Low, Medium, High, Urgent)
- Labels/tags with custom colors
- File attachments (images, documents)
- Status (mapped to column)

### 6. Comments & Collaboration
- Add comments to any task
- View comment thread with timestamps
- @mention team members (future enhancement)

### 7. Activity History
- Track all changes: status updates, assignee changes, edits
- Show timeline of activity on each task
- Display who made changes and when

### 8. Dashboard & Analytics
- Project overview with task counts by status
- Tasks by priority breakdown
- Overdue tasks list
- Team workload view (tasks per assignee)
- Visual charts for progress tracking

---

## Design Direction
- **Professional & Structured**: Clean lines, neutral colors, clear visual hierarchy
- Sidebar navigation for workspace/project switching
- Card-based task design with priority indicators
- Subtle shadows and borders for depth
- Consistent iconography throughout

---

## Technical Approach
- **Backend**: Supabase (Lovable Cloud) for database, auth, and file storage
- **Database tables**: users, workspaces, workspace_members, projects, tasks, comments, activity_logs, labels
- **File storage**: Supabase Storage for task attachments
- **Real-time updates**: Live sync for collaborative editing

---

## Pages
1. **Landing/Auth** – Sign in and sign up forms
2. **Workspace Dashboard** – List of projects with stats
3. **Project Board** – Kanban view with task columns
4. **Task Detail** – Full task view with comments, attachments, activity
5. **Settings** – Workspace and profile settings, member management

