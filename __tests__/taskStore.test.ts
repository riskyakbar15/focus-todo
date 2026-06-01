import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTaskStore } from "../store/taskStore";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("taskStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useTaskStore.setState({ tasks: [], activeTaskId: null });
  });

  it("adds, activates, completes, and deletes a task", async () => {
    await useTaskStore.getState().addTask("Review Expo docs");

    const [task] = useTaskStore.getState().tasks;
    expect(task).toMatchObject({
      title: "Review Expo docs",
      completed: false,
      sessions: 0,
      category: "none",
    });

    await useTaskStore.getState().setActiveTask(task.id);
    await useTaskStore.getState().addSession(task.id);
    await useTaskStore.getState().toggleTask(task.id);

    expect(useTaskStore.getState().activeTaskId).toBe(task.id);
    expect(useTaskStore.getState().tasks[0]).toMatchObject({
      completed: true,
      sessions: 1,
    });

    await useTaskStore.getState().deleteTask(task.id);

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().activeTaskId).toBeNull();
    await expect(AsyncStorage.getItem("focus_todo_active_task")).resolves.toBeNull();
  });

  it("loads only valid tasks and drops stale active task ids", async () => {
    await AsyncStorage.setItem(
      "focus_todo_tasks",
      JSON.stringify([
        {
          id: "task-1",
          title: "Valid",
          completed: false,
          sessions: 0,
          createdAt: 1,
        },
        { id: "", title: "Invalid", completed: false },
      ]),
    );
    await AsyncStorage.setItem("focus_todo_active_task", "missing-task");

    await useTaskStore.getState().loadTasks();

    expect(useTaskStore.getState().tasks).toEqual([
      {
        id: "task-1",
        title: "Valid",
        completed: false,
        sessions: 0,
        createdAt: 1,
        category: "none",
      },
    ]);
    expect(useTaskStore.getState().activeTaskId).toBeNull();
  });
});
