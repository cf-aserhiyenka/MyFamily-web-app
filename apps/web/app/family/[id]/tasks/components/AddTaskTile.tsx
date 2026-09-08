"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTaskSchema } from "@myfamily/shared";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export function AddTaskTile({
  familyId,
  members,
  canManageTasks,
  onCreated,
}: {
  familyId: string;
  members: { id: string; name: string }[];
  canManageTasks: boolean;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("MEDIUM");
  const [points, setPoints] = useState("10");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const addTask = useMutation({
    mutationFn: async () => {
      const payload = createTaskSchema.parse({
        title,
        description: description || undefined,
        priority,
        points: Number(points),
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      const res = await fetch(`/api/family/${familyId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setPoints("10");
      setDueDate("");
      setAssigneeId("");
      setOpen(false);
      onCreated();
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-bark p-4 shadow-sm flex items-center justify-center text-sm"
      >
        {canManageTasks ? "+ Add task" : "+ Propose task"}
      </button>
    );
  }

  return (
    <form
      className="rounded-2xl border border-bark p-4 shadow-sm flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (addTask.isPending) return;
        if (title.trim() && Number(points) > 0) addTask.mutate();
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
        <option value="">No assignee yet</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      {!canManageTasks && (
        <p className="text-xs">This will be sent as a proposal to a parent/guardian first.</p>
      )}
      {addTask.isError && <p className="text-xs text-error">Could not save task.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={addTask.isPending}
          className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
        >
          {addTask.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-bark px-3 py-1 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
