"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddTaskTile } from "./components/AddTaskTile";
import { TaskList, type TaskRow } from "./components/TaskList";
import { PointsBalanceBar, type PointsBalanceRow } from "./components/PointsBalanceBar";
import { RewardsSection, type RewardRow } from "./components/RewardsSection";
import { MembersSection } from "./components/MembersSection";

type MemberOption = { id: string; name: string };

type TasksClientProps = {
  familyId: string;
  myMemberId: string;
  canManageTasks: boolean;
  members: MemberOption[];
  initialTasks: TaskRow[];
  initialBalances: PointsBalanceRow[];
  initialRewards: RewardRow[];
};

const TABS = [
  { key: "tasks", label: "Tasks" },
  { key: "rewards", label: "Rewards" },
  { key: "members", label: "Members" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function TasksClient({
  familyId,
  myMemberId,
  canManageTasks,
  members,
  initialTasks,
  initialBalances,
  initialRewards,
}: TasksClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
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

  const { data: pointsData } = useQuery({
    queryKey: ["points", familyId],
    queryFn: async () => {
      const res = await fetch(`/api/family/${familyId}/points`);
      if (!res.ok) throw new Error("Failed to load points");
      return res.json() as Promise<{ balances: PointsBalanceRow[] }>;
    },
    initialData: { balances: initialBalances },
  });

  const { data: rewardsData } = useQuery({
    queryKey: ["rewards", familyId],
    queryFn: async () => {
      const res = await fetch(`/api/family/${familyId}/rewards`);
      if (!res.ok) throw new Error("Failed to load rewards");
      return res.json() as Promise<{ rewards: RewardRow[] }>;
    },
    initialData: { rewards: initialRewards },
  });

  function refreshTasks() {
    queryClient.invalidateQueries({ queryKey: ["tasks", familyId] });
  }

  function refreshPoints() {
    queryClient.invalidateQueries({ queryKey: ["points", familyId] });
  }

  function refreshRewards() {
    queryClient.invalidateQueries({ queryKey: ["rewards", familyId] });
  }

  function refreshAll() {
    refreshTasks();
    refreshPoints();
  }

  const myBalance = pointsData?.balances.find((b) => b.memberId === myMemberId)?.balance ?? 0;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-display">Tasks</h1>

      <PointsBalanceBar myBalance={myBalance} />

      <nav className="flex gap-2 border-b border-bark">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              activeTab === tab.key ? "border-bark" : "border-transparent text-bark/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "tasks" && (
        <>
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
            onChanged={refreshAll}
          />
        </>
      )}

      {activeTab === "rewards" && (
        <RewardsSection
          familyId={familyId}
          myBalance={myBalance}
          canManageTasks={canManageTasks}
          rewards={rewardsData?.rewards ?? []}
          onChanged={() => {
            refreshRewards();
            refreshPoints();
          }}
        />
      )}

      {activeTab === "members" && (
        <MembersSection
          familyId={familyId}
          myMemberId={myMemberId}
          canManageTasks={canManageTasks}
          balances={pointsData?.balances ?? []}
          onChanged={refreshPoints}
        />
      )}
    </div>
  );
}
