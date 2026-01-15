"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import styles from "./DatePicker.module.css";

export type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string; // YYYY-MM-DD format
  onChange?: (value: string) => void;
  /** Custom icon to show in the input (defaults to calendar icon) */
  icon?: React.ReactNode;
  /** Hide the icon */
  hideIcon?: boolean;
  /** Custom classes for the input/trigger element (for form styling alignment) */
  inputClassName?: string;
};

// Detect iOS devices where native picker works best
function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

type ViewMode = "days" | "months" | "years";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday = 0 to Monday-based (Monday = 0)
  return day === 0 ? 6 : day - 1;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const d = String(day).padStart(2, "0");
  const m = String(month).padStart(2, "0");
  return `${d}.${m}.${year}`;
}

// Get the start year of the decade (e.g., 2020 for 2024)
function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="8" y="14" width="3" height="3" rx="0.5" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      icon,
      hideIcon,
      disabled,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    // Detect platform - use lazy init, default to custom picker on server
    const [useNative] = useState(() => {
      if (typeof window === "undefined") return false;
      return isIOS();
    });
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const [viewYear, setViewYear] = useState(() => {
      if (value) {
        const [y] = value.split("-").map(Number);
        return y || new Date().getFullYear();
      }
      return new Date().getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
      if (value) {
        const [, m] = value.split("-").map(Number);
        return (m || 1) - 1;
      }
      return new Date().getMonth();
    });
    // For decade view navigation
    const [decadeStart, setDecadeStart] = useState(() => {
      if (value) {
        const [y] = value.split("-").map(Number);
        return getDecadeStart(y || new Date().getFullYear());
      }
      return getDecadeStart(new Date().getFullYear());
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync view to current value and reset view mode when opening
    const openPicker = () => {
      if (disabled) return;
      // Sync view to current value
      if (value) {
        const [y, m] = value.split("-").map(Number);
        if (y && m) {
          setViewYear(y);
          setViewMonth(m - 1);
          setDecadeStart(getDecadeStart(y));
        }
      }
      // Reset to days view
      setViewMode("days");
      setIsOpen(true);
    };

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(event: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
      if (!isOpen) return;

      function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
          setIsOpen(false);
          inputRef.current?.focus();
        }
      }

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleInputClick = () => {
      if (!useNative) {
        openPicker();
      }
    };

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleDayClick = (day: number) => {
      const newValue = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      onChange?.(newValue);
      setIsOpen(false);
    };

    const handleMonthClick = (monthIndex: number) => {
      setViewMonth(monthIndex);
      setViewMode("days");
    };

    const handleYearClick = (year: number) => {
      setViewYear(year);
      setDecadeStart(getDecadeStart(year));
      setViewMode("months");
    };

    // Navigation handlers
    const handlePrev = () => {
      if (viewMode === "days") {
        if (viewMonth === 0) {
          setViewMonth(11);
          setViewYear((y) => y - 1);
        } else {
          setViewMonth((m) => m - 1);
        }
      } else if (viewMode === "months") {
        setViewYear((y) => y - 1);
      } else if (viewMode === "years") {
        setDecadeStart((d) => d - 12);
      }
    };

    const handleNext = () => {
      if (viewMode === "days") {
        if (viewMonth === 11) {
          setViewMonth(0);
          setViewYear((y) => y + 1);
        } else {
          setViewMonth((m) => m + 1);
        }
      } else if (viewMode === "months") {
        setViewYear((y) => y + 1);
      } else if (viewMode === "years") {
        setDecadeStart((d) => d + 12);
      }
    };

    // Zoom out: days -> months -> years
    const handleHeaderClick = () => {
      if (viewMode === "days") {
        setViewMode("months");
      } else if (viewMode === "months") {
        setViewMode("years");
      }
    };

    const handleTodayClick = () => {
      const today = new Date();
      const newValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      onChange?.(newValue);
      setIsOpen(false);
    };

    // Generate calendar days
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add the days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    // Generate years for decade view (12 years)
    const yearsInView: number[] = [];
    for (let i = 0; i < 12; i++) {
      yearsInView.push(decadeStart + i);
    }

    // Parse selected date
    const [selectedYear, selectedMonth, selectedDay] = (value || "")
      .split("-")
      .map(Number);
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    // Header title based on view mode
    const getHeaderTitle = () => {
      if (viewMode === "days") {
        return `${MONTHS[viewMonth]} ${viewYear}`;
      } else if (viewMode === "months") {
        return `${viewYear}`;
      } else {
        return `${decadeStart} – ${decadeStart + 11}`;
      }
    };

    // For native iOS picker
    if (useNative) {
      return (
        <div className={cn(styles.container, className)} ref={containerRef}>
          <input
            ref={ref}
            type="date"
            value={value || ""}
            onChange={handleNativeChange}
            disabled={disabled}
            className={cn(
              styles.nativeInput,
              disabled && styles.disabled,
              inputClassName,
            )}
            {...props}
          />
          {!hideIcon && (
            <span className={styles.icon}>
              {icon || <CalendarIcon className={styles.iconGlyph} />}
            </span>
          )}
        </div>
      );
    }

    // Custom picker for non-iOS
    return (
      <div className={cn(styles.container, className)} ref={containerRef}>
        <button
          type="button"
          onClick={handleInputClick}
          disabled={disabled}
          className={cn(
            styles.trigger,
            disabled && styles.disabled,
            inputClassName,
          )}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={props["aria-label"] || "Select date"}
        >
          <span className={styles.triggerText}>
            {value ? (
              formatDisplayDate(value)
            ) : (
              <span className={styles.placeholder}>Select date</span>
            )}
          </span>
          {!hideIcon && (
            <span className={styles.icon}>
              {icon || <CalendarIcon className={styles.iconGlyph} />}
            </span>
          )}
        </button>

        {/* Hidden input for form submission */}
        <input
          ref={ref}
          type="hidden"
          value={value || ""}
          name={props.name}
          id={props.id || id}
          {...props}
        />

        {isOpen && (
          <div
            className={styles.dropdown}
            role="dialog"
            aria-label="Date picker"
          >
            <div className={styles.header}>
              <div className={styles.headerRow}>
                <button
                  type="button"
                  onClick={handlePrev}
                  className={styles.navButton}
                  aria-label={
                    viewMode === "days"
                      ? "Previous month"
                      : viewMode === "months"
                        ? "Previous year"
                        : "Previous decade"
                  }
                >
                  <ChevronLeftIcon className={styles.navIcon} />
                </button>
                <button
                  type="button"
                  onClick={handleHeaderClick}
                  className={cn(
                    styles.headerTitle,
                    viewMode !== "years" && styles.headerTitleClickable,
                  )}
                  disabled={viewMode === "years"}
                  aria-label={
                    viewMode === "days"
                      ? "Select month"
                      : viewMode === "months"
                        ? "Select year"
                        : undefined
                  }
                >
                  {getHeaderTitle()}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className={styles.navButton}
                  aria-label={
                    viewMode === "days"
                      ? "Next month"
                      : viewMode === "months"
                        ? "Next year"
                        : "Next decade"
                  }
                >
                  <ChevronRightIcon className={styles.navIcon} />
                </button>
              </div>
            </div>

            {/* Days view */}
            {viewMode === "days" && (
              <>
                <div className={styles.weekdays}>
                  {WEEKDAYS.map((day) => (
                    <div key={day} className={styles.weekday}>
                      {day}
                    </div>
                  ))}
                </div>

                <div className={styles.days}>
                  {days.map((day, index) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className={styles.emptyDay}
                        />
                      );
                    }

                    const isSelected =
                      selectedYear === viewYear &&
                      selectedMonth === viewMonth + 1 &&
                      selectedDay === day;
                    const isToday =
                      todayYear === viewYear &&
                      todayMonth === viewMonth &&
                      todayDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          styles.day,
                          isSelected && styles.daySelected,
                          isToday && !isSelected && styles.dayToday,
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Months view */}
            {viewMode === "months" && (
              <div className={styles.monthsGrid}>
                {MONTHS_SHORT.map((month, index) => {
                  const isSelected =
                    selectedYear === viewYear && selectedMonth === index + 1;
                  const isCurrentMonth =
                    todayYear === viewYear && todayMonth === index;

                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthClick(index)}
                      className={cn(
                        styles.monthCell,
                        isSelected && styles.monthCellSelected,
                        isCurrentMonth &&
                          !isSelected &&
                          styles.monthCellCurrent,
                      )}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Years view */}
            {viewMode === "years" && (
              <div className={styles.yearsGrid}>
                {yearsInView.map((year) => {
                  const isSelected = selectedYear === year;
                  const isCurrentYear = todayYear === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearClick(year)}
                      className={cn(
                        styles.yearCell,
                        isSelected && styles.yearCellSelected,
                        isCurrentYear && !isSelected && styles.yearCellCurrent,
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}

            <div className={styles.footer}>
              <button
                type="button"
                onClick={handleTodayClick}
                className={styles.todayButton}
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
