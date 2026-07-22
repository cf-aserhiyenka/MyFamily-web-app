"use client";

import { useState } from "react";

export default function DashboardPrototypePage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1">POINTS 99999999</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <section className="rounded-2xl border border-bark p-4 shadow-sm">
            <h2 className="font-semibold mb-2">text</h2>
            <ul className="text-sm flex flex-col gap-1">
              <li>1</li>
              <li>2</li>
            </ul>
          </section> */}

          <section className="rounded-2xl border border-bark p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Tasks</h2>
            <ul className="text-sm flex flex-col gap-2">
              <li className="flex items-center justify-between">
                <span>Clean house (200 points)</span>
                <button type="button" className="text-xs border border-bark rounded px-2 py-1">
                  start
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span>Clean up (20 points)</span>
                <button type="button" className="text-xs border border-bark rounded px-2 py-1">
                  start
                </button>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-bark p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Ostatnie wydatki</h2>
            <ul className="text-sm flex flex-col gap-1">
              <li>food — 142 zl (Anna)</li>
              <li>gas — 200 zl (Jan)</li>
            </ul>
          </section>

          {/* <section className="rounded-2xl border border-bark p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Chat</h2>
            <p className="text-sm">Mama:hi</p>
            <button type="button" className="text-xs border border-bark rounded px-2 py-1 mt-2">
              Chat
            </button>
          </section> */}
        </div>
      </main>
    </div>
  );
}
