"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { TaskRow } from "./TaskList";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toISOString().split("T")[0];
}

export function TaskCard({
  familyId,
  myMemberId,
  canManageTasks,
  members,
  task,
  onChanged,
}: {
  familyId: string;
  myMemberId: string;
  canManageTasks: boolean;
  members: { id: string; name: string }[];
  task: TaskRow;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>(task.priority);
  const [points, setPoints] = useState(String(task.points));
  const [dueDate, setDueDate] = useState(formatDate(task.dueDate) ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");

  async function callAction(path: string) {
    const res = await fetch(`/api/family/${familyId}/tasks/${task.id}/${path}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to ${path} task`);
    return res.json();
  }

  const acceptTask = useMutation({ mutationFn: () => callAction("accept"), onSuccess: onChanged });
  const startTask = useMutation({ mutationFn: () => callAction("start"), onSuccess: onChanged });
  const completeTask = useMutation({ mutationFn: () => callAction("complete"), onSuccess: onChanged });
  const approveTask = useMutation({ mutationFn: () => callAction("approve"), onSuccess: onChanged });

  const updateTask = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          priority,
          points: Number(points),
          dueDate: dueDate || undefined,
          assigneeId: assigneeId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      setEditing(false);
      onChanged();
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: onChanged,
  });

  const isBusy =
    acceptTask.isPending ||
    startTask.isPending ||
    completeTask.isPending ||
    approveTask.isPending ||
    deleteTask.isPending;

  if (editing) {
    return (
      <form
        className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (updateTask.isPending) return;
          updateTask.mutate();
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="1"
          min="1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points"
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="border border-bark rounded-lg px-2 py-1 text-sm"
        >
          <option value="">No assignee</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {updateTask.isError && <p className="text-xs text-red-600">Could not save changes.</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateTask.isPending}
            className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
          >
            {updateTask.isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-bark px-3 py-1 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const isAssignee = task.assigneeId === myMemberId;

  return (
    <div className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-1">
      <p className="text-sm font-semibold">
        {task.title} — {task.points} pts ({task.priority})
      </p>
      {task.description && <p className="text-xs">{task.description}</p>}
      <p className="text-xs">
        Assignee: {task.assigneeName ?? "none"} | Created by: {task.createdByName}
        {formatDate(task.dueDate) ? ` | Due: ${formatDate(task.dueDate)}` : ""}
      </p>

      <div className="flex gap-2 text-xs mt-1 flex-wrap">
        {task.status === "PROPOSED" && canManageTasks && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => acceptTask.mutate()}
            className="border border-bark rounded px-2 py-1 disabled:opacity-50"
          >
            Accept
          </button>
        )}
        {task.status === "TODO" && isAssignee && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => startTask.mutate()}
            className="border border-bark rounded px-2 py-1 disabled:opacity-50"
          >
            Start
          </button>
        )}
        {task.status === "IN_PROGRESS" && isAssignee && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => completeTask.mutate()}
            className="border border-bark rounded px-2 py-1 disabled:opacity-50"
          >
            Mark as done
          </button>
        )}
        {task.status === "DONE" && canManageTasks && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => approveTask.mutate()}
            className="border border-bark rounded px-2 py-1 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {canManageTasks && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="border border-bark rounded px-2 py-1"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (deleteTask.isPending) return;
                if (confirm(`Delete task "${task.title}"?`)) deleteTask.mutate();
              }}
              className="border border-bark rounded px-2 py-1 disabled:opacity-50"
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>

      {(acceptTask.isError || startTask.isError || completeTask.isError || approveTask.isError) && (
        <p className="text-xs text-red-600">Action failed, try again.</p>
      )}
      {deleteTask.isError && <p className="text-xs text-red-600">Could not delete task.</p>}
    </div>
  );
}
