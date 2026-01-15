import { getCurrentUser } from "@/lib/auth/current-user";
import { getScheduleEntries } from "@/lib/schedule";
import { getWeekDays } from "@/lib/week";
import { redirect } from "next/navigation";
import Link from "next/link";
import { extractTimeFromLocalDateTime } from "@/lib/schedule-utils";
import {
  CheckCircle2,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { NextMedicationCard } from "./NextMedicationCard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();
  const weekDays = getWeekDays(today);
  const weekStart = new Date(weekDays[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekDays[6]);
  weekEnd.setHours(23, 59, 59, 999);

  // Get today's entries for the progress calculation
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const todayEntries = await getScheduleEntries(todayStart, todayEnd, timezone);
  const totalToday = todayEntries.length;
  const takenToday = todayEntries.filter(
    (entry) => entry.status === "DONE",
  ).length;
  const progressPercentage =
    totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  // Find next medication (first PLANNED entry, or most recent overdue)
  const plannedEntries = todayEntries
    .filter((entry) => entry.status === "PLANNED")
    .sort(
      (a, b) =>
        new Date(a.utcDateTime).getTime() - new Date(b.utcDateTime).getTime(),
    );
  const nextMedication = plannedEntries[0] || null;

  // Find the second upcoming medication for the progress card
  const secondUpcoming = plannedEntries[1] || null;

  // Format the current date
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate missed medications (overdue and not taken)
  const missedCount = todayEntries.filter((entry) => {
    const entryTime = new Date(entry.utcDateTime);
    return entry.status === "PLANNED" && entryTime < today;
  }).length;

  // Mock data for stats that aren't yet dynamic
  const mockStats = {
    trendRate: 0,
    dayStreak: 7,
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5 sm:py-3 lg:px-8 lg:py-4">
        {/* Welcome Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
            Welcome Back,{" "}
            {user.name?.split(" ")[0] ?? user.email?.split("@")[0]}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {formattedDate}
          </p>
        </header>

        {/* Smart Reminders Card - Commented out for future use
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <BellOff className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">
                Smart Reminders Off
              </p>
              <p className="text-sm text-slate-500">
                Enable to get timely medication reminders
              </p>
            </div>
          </div>
          <button
            type="button"
            className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors"
            aria-label="Toggle smart reminders"
          >
            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
          </button>
        </div>
        */}

        {/* Next Medication Card */}
        <NextMedicationCard entry={nextMedication} />

        {/* Daily Progress Card */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-700 sm:text-sm">
                You&apos;ve taken{" "}
                <span className="font-semibold text-blue-600">
                  {takenToday}
                </span>{" "}
                of <span className="font-semibold">{totalToday}</span>{" "}
                medications today
              </p>
              {secondUpcoming && secondUpcoming.medication && (
                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                  Next up: {secondUpcoming.medication.name} @{" "}
                  {extractTimeFromLocalDateTime(secondUpcoming.localDateTime)}
                </p>
              )}
            </div>
            <span className="text-xl font-bold text-blue-600 sm:flex-shrink-0 sm:text-2xl">
              {progressPercentage}%
            </span>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full sm:mt-5 sm:h-3"
            style={{ backgroundColor: "#b3d9ff" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: "#2196f3",
              }}
            />
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {/* Adherence Rate */}
          <div className="flex flex-col justify-between rounded-2xl bg-rose-50 p-3 sm:p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 sm:h-10 sm:w-10">
              <CheckCircle2 className="h-4 w-4 text-rose-500 sm:h-5 sm:w-5" />
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xl font-bold text-blue-600 sm:text-2xl">
                {progressPercentage}%
              </p>
              <p className="text-[11px] text-slate-500 sm:text-xs">Adherence</p>
            </div>
          </div>

          {/* Trend */}
          <div className="flex flex-col justify-between rounded-2xl bg-orange-50 p-3 sm:p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 sm:h-10 sm:w-10">
              <TrendingUp className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xl font-bold text-orange-600 sm:text-2xl">
                {mockStats.trendRate}%
              </p>
              <p className="text-[11px] text-slate-500 sm:text-xs">Trend</p>
            </div>
          </div>

          {/* Day Streak */}
          <div className="flex flex-col justify-between rounded-2xl bg-violet-50 p-3 sm:p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 sm:h-10 sm:w-10">
              <Users className="h-4 w-4 text-violet-500 sm:h-5 sm:w-5" />
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xl font-bold text-violet-600 sm:text-2xl">
                {mockStats.dayStreak}
              </p>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Day Streak
              </p>
            </div>
          </div>

          {/* Missed */}
          <div className="flex flex-col justify-between rounded-2xl bg-red-50 p-3 sm:p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
              <AlertTriangle className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xl font-bold text-red-600 sm:text-2xl">
                {missedCount}
              </p>
              <p className="text-[11px] text-slate-500 sm:text-xs">Missed</p>
            </div>
          </div>
        </div>

        {/* Today's Medications Section (placeholder) */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-6 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Today&apos;s Medications ({totalToday})
            </h2>
            <Link
              href="/today"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 sm:text-sm"
            >
              View All
            </Link>
          </div>
          {totalToday === 0 ? (
            <p className="mt-4 text-center text-sm text-slate-500">
              No medications scheduled for today.
            </p>
          ) : (
            <p className="mt-4 text-center text-sm text-slate-500">
              {takenToday} of {totalToday} medications completed.{" "}
              <Link href="/today" className="text-blue-600 hover:underline">
                View details
              </Link>
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Link
            href="/medications/new"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:py-3 sm:text-sm"
          >
            Add Medication
          </Link>
          <Link
            href="/schedule"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:py-3 sm:text-sm"
          >
            Full Schedule
          </Link>
          <Link
            href="/week"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:py-3 sm:text-sm"
          >
            Week View
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/medications/new"
        className="fixed right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
        aria-label="Add medication"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </div>
  );
}
