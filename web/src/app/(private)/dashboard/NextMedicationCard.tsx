"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CircleDot,
  CheckCircle2,
  Utensils,
  // AlarmClock, // Commented out - will be used for 15m snooze button later
} from "lucide-react";
import {
  updateScheduleEntryStatus,
  extractTimeFromLocalDateTime,
} from "@/lib/schedule-utils";
import type { ScheduleEntryItem } from "@/lib/schedule";

type NextMedicationCardProps = {
  entry: ScheduleEntryItem | null;
};

const mealTimingLabels: Record<string, string> = {
  before: "Before meal",
  with: "With meal",
  after: "After meal",
  anytime: "Anytime",
};

const mealTimingColors: Record<string, string> = {
  before: "text-orange-400", // #fb923c
  with: "text-green-600", // #16a34a
  after: "text-orange-500", // #f97316
  anytime: "text-indigo-500", // #6366f1
};

export function NextMedicationCard({ entry }: NextMedicationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!entry || !entry.medication) {
    return (
      <div className="mb-4 overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex items-center justify-center px-4 py-6 sm:px-5 sm:py-8">
          <p className="text-xs text-slate-500 sm:text-sm">
            No upcoming medications scheduled.
          </p>
        </div>
      </div>
    );
  }

  // Calculate time difference using local times
  // localDateTime format: "YYYY-MM-DDTHH:mm"
  const parseLocalDateTime = (localDateTime: string): Date => {
    // Parse the local date-time string and create a Date object
    // This will be interpreted in the user's local timezone
    const [datePart, timePart] = localDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  const entryTime = parseLocalDateTime(entry.localDateTime);
  const currentTime = new Date(); // Current local time
  const timeDiffMs = entryTime.getTime() - currentTime.getTime();
  const isOverdue = timeDiffMs < 0 && entry.status === "PLANNED";
  const absoluteDiffMs = Math.abs(timeDiffMs);

  const hours = Math.floor(absoluteDiffMs / (1000 * 60 * 60));
  const minutes = Math.floor((absoluteDiffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Format the time difference string
  const formatTimeDiff = () => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Format the time (same as Today view)
  const formattedTime = extractTimeFromLocalDateTime(entry.localDateTime);

  // Get medication details
  const medicationName = entry.medication.name;
  const dosage = entry.medication.dose ? `${entry.medication.dose}mg` : "";
  const quantityUnits =
    entry.quantity && entry.units ? `${entry.quantity} ${entry.units}` : "";
  const mealTimingKey = entry.mealTiming || "anytime";
  const mealTimingLabel = mealTimingLabels[mealTimingKey] || "ANYTIME";
  const mealTimingColor = mealTimingColors[mealTimingKey] || "text-indigo-500";

  const handleTake = async () => {
    setIsUpdating(true);
    try {
      await updateScheduleEntryStatus(entry.id, "DONE");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to mark medication as taken:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Skip handler - commented out for future use
  // const handleSkip = async () => {
  //   // For now, skip also marks as DONE (could be a different status in future)
  //   setIsUpdating(true);
  //   try {
  //     await updateScheduleEntryStatus(entry.id, "DONE");
  //     startTransition(() => {
  //       router.refresh();
  //     });
  //   } catch (error) {
  //     console.error("Failed to skip medication:", error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  const isDisabled = isUpdating || isPending;

  return (
    <div className="mb-4 overflow-hidden rounded-3xl border-2 border-blue-300 bg-blue-50 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 sm:h-12 sm:w-12">
            <CircleDot className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 sm:text-base">
              Next Medication
            </p>
            {isOverdue ? (
              <div className="flex items-center gap-1 text-xs font-medium text-red-500 sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{formatTimeDiff()} overdue</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>in {formatTimeDiff()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {/* 15m Snooze button - commented out for future use
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            disabled={isDisabled}
          >
            <AlarmClock className="h-4 w-4" />
            15m
          </button>
          */}
          {/* Skip button - commented out for future use
          <button
            type="button"
            onClick={handleSkip}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            disabled={isDisabled}
          >
            <Clock className="h-4 w-4" />
            Skip
          </button>
          */}
          <button
            type="button"
            onClick={handleTake}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-auto sm:text-base"
            style={{
              backgroundColor: isUpdating ? "#2196f380" : "#00a63e",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !isUpdating) {
                e.currentTarget.style.backgroundColor = "#008530";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled && !isUpdating) {
                e.currentTarget.style.backgroundColor = "#00a63e";
              }
            }}
            disabled={isDisabled}
          >
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            {isUpdating ? "..." : "Take"}
          </button>
        </div>
      </div>
      {/* Medication Details Card */}
      <div className="mx-3 mb-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:mx-4 sm:mb-4 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
            {medicationName}
          </h3>
          {dosage && (
            <span className="text-sm font-medium text-slate-500 sm:text-base">
              {dosage}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:gap-3 sm:text-sm">
          {quantityUnits && (
            <>
              <span className="font-medium text-slate-600">
                {quantityUnits}
              </span>
              <span className="text-slate-300">•</span>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
            <span>{formattedTime}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Utensils
              className={`h-3.5 w-3.5 ${mealTimingColor} sm:h-4 sm:w-4`}
            />
            <span>{mealTimingLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
