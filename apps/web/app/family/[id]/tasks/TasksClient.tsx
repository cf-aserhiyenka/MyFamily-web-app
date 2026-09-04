"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddTaskTile } from "./components/AddTaskTile";
import { TaskList, type TaskRow } from "./components/TaskList";

type MemberOption = { id: string; name: string };

type TasksClientProps = {
  familyId: string;
  myMemberId: string;
  canManageTasks: boolean;
  members: MemberOption[];
  initialTasks: TaskRow[];
};

export function TasksClient({
  familyId,
  myMemberId,
  canManageTasks,
  members,
  initialTasks,
}: TasksClientProps) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["tasks", familyId],
    queryFn: async () => {
      const res = await fetch(`/api/family/${familyId}/tasks`);
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json() as Promise<{ tasks: TaskRow[] }>;
    },
    initialData: { tasks: initialTasks },
  });

  function refreshTasks() {
    queryClient.invalidateQueries({ queryKey: ["tasks", familyId] });
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-display">Tasks</h1>

      <AddTaskTile
        familyId={familyId}
        members={members}
        canManageTasks={canManageTasks}
        onCreated={refreshTasks}
      />

      <TaskList
        familyId={familyId}
        myMemberId={myMemberId}
        canManageTasks={canManageTasks}
        members={members}
        tasks={data?.tasks ?? []}
        onChanged={refreshTasks}
      />
    </div>
  );
}
