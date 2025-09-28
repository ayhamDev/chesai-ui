import type { Meta, StoryObj } from "@storybook/react";
import { format } from "date-fns";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
// Assuming all components are exported from a central barrel file
// Adjust the import path as necessary for your project structure
import {
  AppBar,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FAB,
  IconButton,
  Input,
  List,
  SelectInput,
  Tabs,
  TextArea,
  Typography,
} from "../lib/components";

// --- MOCK DATA AND TYPES ---
interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  project: "Work" | "Personal" | "Study";
  isCompleted: boolean;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finalize Q3 report presentation",
    description: "Gather all data and create slides.",
    dueDate: new Date(2024, 6, 25),
    project: "Work",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Book flight tickets for vacation",
    description: "Check for best deals on Tuesday.",
    dueDate: new Date(2024, 7, 1),
    project: "Personal",
    isCompleted: false,
  },
  {
    id: 3,
    title: "Study for React certification",
    description: "Complete the advanced hooks module.",
    dueDate: new Date(2024, 6, 30),
    project: "Study",
    isCompleted: true,
  },
  {
    id: 4,
    title: "Schedule dentist appointment",
    description: "Call Dr. Smith's office for a check-up.",
    dueDate: new Date(2024, 7, 5),
    project: "Personal",
    isCompleted: false,
  },
  {
    id: 5,
    title: "Submit expense reports",
    description: "Include receipts from the business trip.",
    dueDate: new Date(2024, 6, 28),
    project: "Work",
    isCompleted: true,
  },
  {
    id: 6,
    title: "Buy groceries for the week",
    description: "Milk, eggs, bread, and vegetables.",
    dueDate: new Date(2024, 6, 22),
    project: "Personal",
    isCompleted: false,
  },
];

const projectOptions = [
  { value: "Work", label: "Work" },
  { value: "Personal", label: "Personal" },
  { value: "Study", label: "Study" },
];

// --- STORYBOOK META ---
const meta: Meta = {
  title: "Examples/Task Manager",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "A complete, interactive Task Manager application built exclusively with components from the `chesai-ui` library. This example demonstrates how components like `AppBar`, `Tabs`, `List`, `Dialog`, `FAB`, and various form inputs can be composed to create a modern, responsive user interface.",
      },
    },
  },
};

export default meta;

// --- MAIN COMPONENT FOR THE STORY ---
const TaskManagerApp = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the "Add Task" dialog form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(new Date());
  const [newTaskProject, setNewTaskProject] = useState<string>("Personal");

  const handleToggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskDate) {
      alert("Please fill in the task title and due date.");
      return;
    }

    const newTask: Task = {
      id: Date.now(), // simple unique id
      title: newTaskTitle,
      description: newTaskDesc,
      dueDate: newTaskDate,
      project: newTaskProject as Task["project"],
      isCompleted: false,
    };

    setTasks([newTask, ...tasks]);

    // Reset form and close dialog
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskDate(new Date());
    setNewTaskProject("Personal");
    setIsDialogOpen(false);
  };

  const TaskList = ({
    taskFilter,
  }: {
    taskFilter: (task: Task) => boolean;
  }) => {
    const filteredTasks = tasks.filter(taskFilter);
    return (
      <Card shape="sharp" className="p-0">
        {filteredTasks.length > 0 ? (
          <List dividers>
            {filteredTasks.map((task) => (
              <List.Item
                key={task.id}
                id={task.id}
                headline={task.title}
                supportingText={`Due: ${format(
                  task.dueDate,
                  "MMM d, yyyy"
                )} • ${task.project}`}
                className={task.isCompleted ? "opacity-50" : ""}
                startAdornment={
                  <Checkbox
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    aria-label={`Mark "${task.title}" as complete`}
                  />
                }
                swipeActions={
                  <div className="flex h-full">
                    <Button
                      shape="sharp"
                      className="h-full !rounded-none bg-red-500 hover:bg-red-600"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label={`Delete task "${task.title}"`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                }
              />
            ))}
          </List>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-48 text-center">
            <Typography variant="large">All Clear!</Typography>
            <Typography variant="muted">
              No tasks to show in this view.
            </Typography>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="relative h-screen bg-graphite-background">
      <AppBar.Provider>
        <Tabs defaultValue="all" variant="secondary" pageTransition="slide">
          <AppBar
            size="lg"
            scrollBehavior="conditionally-sticky"
            stickyHideTarget="main-row"
            appBarColor="card"
            animatedBehavior={["shadow"]}
            children={
              <Typography variant="h2" className="truncate font-bold">
                My Tasks
              </Typography>
            }
            smallHeaderContent={
              <Typography variant="h4" className="font-semibold">
                My Tasks
              </Typography>
            }
            endAdornments={[
              <IconButton
                key="search"
                variant="ghost"
                aria-label="Search tasks"
              >
                <Search />
              </IconButton>,
            ]}
            largeHeaderContent={
              <div className="-mx-4 -mb-4">
                <Tabs.List className="!border-b-0">
                  <Tabs.Trigger value="all">All</Tabs.Trigger>
                  <Tabs.Trigger value="active">Active</Tabs.Trigger>
                  <Tabs.Trigger value="completed">Completed</Tabs.Trigger>
                </Tabs.List>
              </div>
            }
          />

          {/* This padding-top is crucial. It must match the expanded AppBar height. */}
          <div className="pt-[160px]">
            <Tabs.Content>
              <Tabs.Panel value="all">
                <TaskList taskFilter={() => true} />
              </Tabs.Panel>
              <Tabs.Panel value="active">
                <TaskList taskFilter={(task) => !task.isCompleted} />
              </Tabs.Panel>
              <Tabs.Panel value="completed">
                <TaskList taskFilter={(task) => task.isCompleted} />
              </Tabs.Panel>
            </Tabs.Content>
          </div>
        </Tabs>
      </AppBar.Provider>

      {/* --- ADD TASK DIALOG AND FAB --- */}
      <Dialog
        variant="fullscreen"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogTrigger asChild>
          <div className="absolute z-10 bottom-8 right-8">
            <FAB
              size="md"
              icon={<Plus className="h-7 w-7" />}
              isExtended={false}
              aria-label="Add new task"
            />
          </div>
        </DialogTrigger>
        <DialogContent shape="minimal">
          <DialogHeader>
            <DialogTitle>Create a New Task</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-6 py-4 px-4">
            <Input
              label="Task Title"
              placeholder="e.g., Finalize Q3 report"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <TextArea
              label="Description (Optional)"
              placeholder="Add more details..."
              rows={3}
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Due Date"
                mode="single"
                variant={"modal"}
                value={newTaskDate}
                onChange={(val) => setNewTaskDate(val as Date | undefined)}
              />
              <SelectInput
                label="Project"
                items={projectOptions}
                value={newTaskProject}
                onValueChange={setNewTaskProject}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- STORY EXPORT ---
type Story = StoryObj<typeof TaskManagerApp>;

export const Default: Story = {
  render: () => <TaskManagerApp />,
};
