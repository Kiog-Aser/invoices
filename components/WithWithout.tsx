"use client";

import { useState } from "react";
import { FaTimes, FaCheck, FaPowerOff } from "react-icons/fa";
import { FiCalendar, FiClock, FiTarget, FiUsers } from "react-icons/fi";

const WITH_WITHOUT = [
  {
    title: "With Boilerplate",
    points: [
      "Auth, payments, and dashboard ready on day one",
      "Production-grade code and UI",
      "Focus on your unique features",
      "Launch in days, not months",
    ],
    color: "bg-success/10 border-success/30",
  },
  {
    title: "Without Boilerplate",
    points: [
      "Weeks spent on setup and integrations",
      "Inconsistent UI and tech debt",
      "Delayed launch and lost momentum",
      "Reinventing the wheel",
    ],
    color: "bg-error/10 border-error/30",
  },
];

export default function WithWithout() {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-mono">With vs Without a Boilerplate</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {WITH_WITHOUT.map((col) => (
            <div key={col.title} className={`card border rounded-xl p-8 ${col.color}`}>
              <div className="font-bold text-lg font-mono mb-4">{col.title}</div>
              <ul className="space-y-3">
                {col.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 font-mono">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
