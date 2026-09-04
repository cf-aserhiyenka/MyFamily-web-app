"use client";

import { TaskCard } from "./TaskCard";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "PROPOSED" | "TODO" | "IN_PROGRESS" | "DONE" | "APPROVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  points: number;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdByName: string;
};

const STATUS_SECTIONS = [
  { key: "PROPOSED", label: "Proposed" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Waiting for approval" },
  { key: "APPROVED", label: "Approved" },
] as const;

export function TaskList({
  familyId,
  myMemberId,
  canManageTasks,
  members,
  tasks,
  onChanged,
}: {
  familyId: string;
  myMemberId: string;
  canManageTasks: boolean;
  members: { id: string; name: string }[];
  tasks: TaskRow[];
  onChanged: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {STATUS_SECTIONS.map((section) => {
        const sectionTasks = tasks.filter((task) => task.status === section.key);
        if (sectionTasks.length === 0) return null;

        return (
          <section key={section.key} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{section.label}</h2>
            <div className="flex flex-col gap-2">
              {sectionTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  familyId={familyId}
                  myMemberId={myMemberId}
                  canManageTasks={canManageTasks}
                  members={members}
                  task={task}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </section>
        );
      })}

      {tasks.length === 0 && <p className="text-sm">No tasks yet.</p>}
    </div>
  );
}
