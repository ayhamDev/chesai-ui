import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Home,
  MoreVertical,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import React, { createContext, useContext, useRef, useState } from "react";
import DeviceFrame from "../../device";
import { toast, Toaster } from "../../toast";
// Import all the necessary components from the library
import { AppBar } from "../../appbar";
import { Avatar } from "../../avatar";
import { BottomTabs } from "../../bottom-tabs";
import { Button } from "../../button";
import { Card } from "../../card";
import { DatePicker } from "../../date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../dialog";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import { FAB } from "../../fab";
import { IconButton } from "../../icon-button";
import { Input } from "../../input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "../../item";
import { LayoutRouter, useLayoutRouter } from "../../layout-router";
import { Select } from "../../select"; // FIX: Imported as Select
import { ShallowRouter, useRouter } from "../../shallow-router";
import {
  createStackNavigator,
  useNavigation,
  useRoute,
} from "../../stack-router";
import { Switch } from "../../switch";
import { Textarea } from "../../textarea";
import { Typography } from "../../typography";

// ... (Meta and Mock Data code remains unchanged) ...
const meta: Meta = {
  title: "Showcase/Full Mobile App Demo",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A complete mobile application example built with `chesai-ui` components. It demonstrates nested navigation (`BottomTabs` + `StackRouter` + `LayoutRouter`), state management, form handling, and advanced component composition.",
      },
    },
  },
};

export default meta;

// ... (Mock Data Generation and Context - unchanged)
const MOCK_PROJECTS = [
  {
    id: "proj-1",
    title: "Website Redesign",
    color: "bg-blue-500",
    taskCount: 5,
    avatar: "WR",
  },
  {
    id: "proj-2",
    title: "Mobile App Launch",
    color: "bg-purple-500",
    taskCount: 8,
    avatar: "ML",
  },
  {
    id: "proj-3",
    title: "API Integration",
    color: "bg-green-500",
    taskCount: 3,
    avatar: "AI",
  },
];

const MOCK_TASKS = [
  {
    id: "task-1",
    title: "Draft homepage copy",
    projectId: "proj-1",
    dueDate: new Date(2024, 6, 25),
    completed: false,
  },
  {
    id: "task-2",
    title: "Design mobile mockups",
    projectId: "proj-1",
    dueDate: new Date(2024, 6, 28),
    completed: false,
  },
  {
    id: "task-3",
    title: "Setup CI/CD pipeline",
    projectId: "proj-2",
    dueDate: new Date(2024, 7, 1),
    completed: true,
  },
  {
    id: "task-4",
    title: "Authenticate with OAuth provider",
    projectId: "proj-3",
    dueDate: new Date(2024, 7, 5),
    completed: false,
  },
  {
    id: "task-5",
    title: "Publish to App Store",
    projectId: "proj-2",
    dueDate: new Date(2024, 7, 15),
    completed: false,
  },
];

// Simple global state using React Context for the demo
const AppStateContext = createContext({
  tasks: MOCK_TASKS,
  projects: MOCK_PROJECTS,
  toggleTask: (taskId: string) => {},
  deleteTask: (taskId: string) => {},
  addTask: (task: any) => {},
});
const useAppState = () => useContext(AppStateContext);

// --- 2. NAVIGATION STACKS ---

type HomeStackParamList = {
  Inbox: undefined;
  TaskDetails: { taskId: string };
};
const HomeStack = createStackNavigator<HomeStackParamList>();

type ProjectsStackParamList = {
  ProjectList: undefined;
};
const ProjectsStack = createStackNavigator<ProjectsStackParamList>();

type SettingsStackParamList = {
  Settings: undefined;
};
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// --- 3. SCREEN COMPONENTS ---

// --- INBOX TAB ---
const InboxScreen = () => {
  const navigation = useNavigation<HomeStackParamList>();
  const { tasks } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-graphite-background">
      <AppBar
        size="lg"
        largeHeaderRowHeight={50}
        scrollBehavior="conditionally-sticky"
        appBarColor="background"
        animatedBehavior={["shadow"]}
        scrollContainerRef={scrollRef}
        children={
          <Typography variant="h4" className="truncate font-bold">
            Inbox
          </Typography>
        }
        largeHeaderContent={
          <Input
            variant="flat"
            shape="full"
            startContent={<Search className="h-5 w-5 text-gray-500" />}
            placeholder="Search tasks..."
          />
        }
      />
      <ElasticScrollArea
        ref={scrollRef}
        className="flex-1"
        pullToRefresh
        onRefresh={() => new Promise((res) => setTimeout(res, 1500))}
      >
        <main className="p-4 pt-[110px]">
          <ItemGroup>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onPress={() =>
                  navigation.push("TaskDetails", { taskId: task.id })
                }
              />
            ))}
          </ItemGroup>
        </main>
      </ElasticScrollArea>
      <div className="absolute bottom-20 right-6 z-10">
        <FAB isExtended icon={<Plus />} onClick={() => setIsNewTaskOpen(true)}>
          New Task
        </FAB>
      </div>
      <NewTaskDialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
    </div>
  );
};

const TaskDetailsScreen = () => {
  const navigation = useNavigation<HomeStackParamList>();
  const route = useRoute<HomeStackParamList, "TaskDetails">();
  const { tasks, deleteTask } = useAppState();
  const task = tasks.find((t) => t.id === route.params.taskId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!task) {
    return (
      <div className="p-6 pt-[70px]">
        <Typography>Task not found.</Typography>
      </div>
    );
  }

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success("Task deleted");
    navigation.goBack();
  };

  return (
    <ElasticScrollArea ref={navigation.scrollContainerRef}>
      <div className="p-6 pt-[70px]">
        <div className="flex flex-col gap-6">
          <Input label="Task Title" defaultValue={task.title} size="lg" />
          <Textarea label="Description" placeholder="Add a description..." />
          <DatePicker label="Due Date" value={task.dueDate} />
          {/* UPDATED: SelectInput -> Select */}
          <Select
            label="Project"
            items={MOCK_PROJECTS.map((p) => ({
              value: p.id,
              label: p.title,
            }))}
            value={task.projectId}
          />
          <Button onClick={() => navigation.goBack()}>Save Changes</Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Task
          </Button>
        </div>
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          variant="basic"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to
                permanently delete this task?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ElasticScrollArea>
  );
};

// ... (Rest of the file remains largely the same, ensuring Select is used if necessary)
// Only ProjectDetailsScreen, SettingsScreen, TaskItem, NewTaskDialog, AppShell, AppStateProvider etc are below.
// None of them explicitly used SelectInput in previous versions except maybe implicit or passed props.
// I will provide the rest for completeness.

// --- PROJECTS TAB ---
const ProjectsScreen = () => {
  const navigation = useNavigation<ProjectsStackParamList>();
  const { projects } = useAppState();

  return (
    <LayoutRouter>
      <LayoutRouter.List>
        <div className="flex h-full flex-col bg-graphite-background">
          <AppBar appBarColor="background">
            <Typography variant="h4" className="font-bold">
              Projects
            </Typography>
          </AppBar>
          <ElasticScrollArea
            className="flex-1 p-4 pt-[70px]"
            ref={navigation.scrollContainerRef}
          >
            <div className="grid grid-cols-2 gap-4">
              {projects.map((project) => (
                <LayoutRouter.Link key={project.id} id={project.id}>
                  <Card
                    variant="primary"
                    shape="minimal"
                    className="aspect-square flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <LayoutRouter.SharedElement tag="avatar">
                        <Avatar
                          fallback={project.avatar}
                          className={`!rounded-lg ${project.color}`}
                        />
                      </LayoutRouter.SharedElement>
                    </div>
                    <div>
                      <LayoutRouter.SharedElement tag="title">
                        <Typography variant="large">{project.title}</Typography>
                      </LayoutRouter.SharedElement>
                      <Typography variant="muted">
                        {project.taskCount} tasks
                      </Typography>
                    </div>
                  </Card>
                </LayoutRouter.Link>
              ))}
            </div>
          </ElasticScrollArea>
        </div>
      </LayoutRouter.List>
      {projects.map((project) => (
        <LayoutRouter.Screen key={project.id} id={project.id} dismissible>
          <ProjectDetailsScreen project={project} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  );
};

const ProjectDetailsScreen = ({ project }: { project: any }) => {
  const { goBack } = useLayoutRouter();
  const { tasks } = useAppState();
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col bg-graphite-background">
      <AppBar
        scrollBehavior="conditionally-sticky"
        animatedBehavior={["shadow"]}
        appBarColor="background"
        scrollContainerRef={scrollRef}
        startAdornment={
          <IconButton variant="ghost" onClick={goBack}>
            <ArrowLeft />
          </IconButton>
        }
      />
      <ElasticScrollArea ref={scrollRef} className="flex-1">
        <main className="p-4 pt-[70px]">
          <div className="flex items-center gap-4 mb-6">
            <LayoutRouter.SharedElement tag="avatar">
              <Avatar
                size="xl"
                fallback={project.avatar}
                className={`!rounded-xl ${project.color}`}
              />
            </LayoutRouter.SharedElement>
            <div>
              <LayoutRouter.SharedElement tag="title">
                <Typography variant="h2">{project.title}</Typography>
              </LayoutRouter.SharedElement>
              <Typography variant="lead">{project.taskCount} tasks</Typography>
            </div>
          </div>
          <ItemGroup>
            {projectTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ItemGroup>
        </main>
      </ElasticScrollArea>
    </div>
  );
};

// --- SETTINGS TAB ---
const SettingsScreen = () => {
  const navigation = useNavigation<SettingsStackParamList>();
  return (
    <div className="flex h-full flex-col bg-graphite-background">
      <AppBar appBarColor="background">
        <Typography variant="h4" className="font-bold">
          Settings
        </Typography>
      </AppBar>
      <ElasticScrollArea
        className="flex-1 p-4 pt-[70px]"
        ref={navigation.scrollContainerRef}
      >
        <ItemGroup>
          <Item
            variant="secondary"
            onClick={() => {}}
            className="cursor-pointer"
          >
            <ItemContent>
              <ItemTitle>Enable Notifications</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Switch defaultChecked />
            </ItemActions>
          </Item>
          <Item
            variant="secondary"
            onClick={() => {}}
            className="cursor-pointer"
          >
            <ItemContent>
              <ItemTitle>Dark Mode</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Switch />
            </ItemActions>
          </Item>
          <Item
            variant="secondary"
            onClick={() => {}}
            className="cursor-pointer"
          >
            <ItemContent>
              <ItemTitle>Profile</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRight />
            </ItemActions>
          </Item>
        </ItemGroup>
      </ElasticScrollArea>
    </div>
  );
};

// --- 4. REUSABLE COMPONENTS ---
const TaskItem = ({ task, onPress }: { task: any; onPress?: () => void }) => {
  return (
    <Item
      variant="secondary"
      onClick={onPress}
      className={onPress ? "cursor-pointer" : ""}
    >
      <ItemContent>
        <ItemTitle
          className={task.completed ? "line-through text-gray-400" : ""}
        >
          {task.title}
        </ItemTitle>
        <ItemDescription>
          Due: {task.dueDate.toLocaleDateString()}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <IconButton variant="ghost" size="sm">
          <MoreVertical size={16} />
        </IconButton>
      </ItemActions>
    </Item>
  );
};

const NewTaskDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { addTask } = useAppState();
  const [title, setTitle] = useState("");

  const handleAddTask = () => {
    if (title.trim()) {
      addTask({
        id: `task-${Date.now()}`,
        title,
        projectId: "proj-1",
        dueDate: new Date(),
        completed: false,
      });
      toast.success("Task added!");
      onOpenChange(false);
      setTitle("");
    } else {
      toast.error("Task title cannot be empty.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} variant="basic">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex flex-col gap-4">
          <Input
            label="Task Title"
            placeholder="e.g., Finalize Q3 report"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="lg"
          />
          <Button key="add" size="sm" onClick={handleAddTask}>
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- 5. APP SHELL & TAB NAVIGATION ---
const AppShell = () => {
  const { path: activeTab, push } = useRouter();
  const iconSize = 24;
  const initialTab = "home";

  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full">
        {(activeTab === "/" || activeTab === "/home") && (
          <HomeStack.Navigator initialRouteName="Inbox">
            <HomeStack.Screen
              name="Inbox"
              component={InboxScreen}
              options={{ headerShown: false }}
            />
            <HomeStack.Screen
              name="TaskDetails"
              component={TaskDetailsScreen}
              options={{ title: "Task Details" }}
            />
          </HomeStack.Navigator>
        )}
        {activeTab === "/projects" && (
          <ProjectsStack.Navigator initialRouteName="ProjectList">
            <ProjectsStack.Screen
              name="ProjectList"
              component={ProjectsScreen}
              options={{ headerShown: false }}
            />
          </ProjectsStack.Navigator>
        )}
        {activeTab === "/settings" && (
          <SettingsStack.Navigator initialRouteName="Settings">
            <SettingsStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
          </SettingsStack.Navigator>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50">
        <BottomTabs.Navigator
          mode="attached"
          shape="full"
          activeTab={activeTab === "/" ? initialTab : activeTab.substring(1)}
          onTabPress={(tab) => push(`/${tab}`)}
        >
          <BottomTabs.Screen
            name="home"
            label="Inbox"
            icon={() => <Home size={iconSize} />}
          />
          <BottomTabs.Screen
            name="projects"
            label="Projects"
            icon={() => <ClipboardList size={iconSize} />}
          />
          <BottomTabs.Screen
            name="settings"
            label="Settings"
            icon={() => <Settings size={iconSize} />}
          />
        </BottomTabs.Navigator>
      </div>
    </div>
  );
};

// --- 6. THE FINAL STORY ---
const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const projects = MOCK_PROJECTS;

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((t) => t.id !== taskId));
  };

  const addTask = (task: any) => {
    setTasks((currentTasks) => [task, ...currentTasks]);
  };

  return (
    <AppStateContext.Provider
      value={{ tasks, projects, toggleTask, deleteTask, addTask }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const TasksApp: StoryObj = {
  render: () => (
    <DeviceFrame>
      <AppStateProvider>
        <ShallowRouter paramName="tab">
          <AppShell />
        </ShallowRouter>
      </AppStateProvider>
      <Toaster position="bottom-center" />
    </DeviceFrame>
  ),
};
