"use client";

import { useState } from "react";
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

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PROPOSED", label: "Proposed" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Waiting for approval" },
  { key: "APPROVED", label: "Approved" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

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
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter((task) => task.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`border border-bark rounded-full px-3 py-1 text-xs ${
              filter === s.key ? "bg-bark text-cream" : ""
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filteredTasks.map((task) => (
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
        {filteredTasks.length === 0 && <p className="text-sm">No tasks here.</p>}
      </div>
    </div>
  );
}
