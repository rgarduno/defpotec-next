"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  CalendarCheck,
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Clock, 
  Sparkles,
  Flag,
  ArrowRight
} from "lucide-react";

interface TouchDatePickerProps {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  required?: boolean;
  minDate?: string; // "YYYY-MM-DD"
  referenceStartDate?: string; // "YYYY-MM-DD" for smart end-date shortcuts
  placeholder?: string;
  subtitle?: string;
  type?: "start" | "end" | "general";
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAY_NAMES = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

const WEEKDAY_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

// Helper to safely parse YYYY-MM-DD without UTC timezone offset bugs
function parseYMD(str?: string | null): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

// Helper to format YYYY-MM-DD
function formatYMD(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Add days to a YYYY-MM-DD string
function addDays(dateStr?: string | null, daysToAdd: number = 0): string {
  if (!dateStr) return "";
  const p = parseYMD(dateStr);
  if (!p) return "";
  const d = new Date(p.year, p.month, p.day);
  d.setDate(d.getDate() + daysToAdd);
  return formatYMD(d.getFullYear(), d.getMonth(), d.getDate());
}

// Get next occurrence of a day of the week (0=Sun, 6=Sat)
function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return formatYMD(target.getFullYear(), target.getMonth(), target.getDate());
}

// Calculate days difference between two YMD strings (inclusive)
function getDaysDiff(startYMD?: string | null, endYMD?: string | null): number {
  if (!startYMD || !endYMD) return 1;
  const p1 = parseYMD(startYMD);
  const p2 = parseYMD(endYMD);
  if (!p1 || !p2) return 1;
  const d1 = new Date(p1.year, p1.month, p1.day).getTime();
  const d2 = new Date(p2.year, p2.month, p2.day).getTime();
  const diffTime = d2 - d1;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

export default function TouchDatePicker({
  label,
  value,
  onChange,
  required = false,
  minDate,
  referenceStartDate,
  placeholder,
  subtitle,
  type = referenceStartDate ? "end" : "start",
}: TouchDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Today's YMD
  const todayYMD = useMemo(() => {
    const now = new Date();
    return formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Currently viewed month/year in the calendar
  const [viewYear, setViewYear] = useState<number>(() => {
    const p = parseYMD(value) || parseYMD(referenceStartDate);
    return p ? p.year : new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const p = parseYMD(value) || parseYMD(referenceStartDate);
    return p ? p.month : new Date().getMonth();
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // When value changes or modal opens, sync calendar view to the value date
  useEffect(() => {
    if (isOpen) {
      const p = parseYMD(value) || parseYMD(referenceStartDate);
      if (p) {
        setViewYear(p.year);
        setViewMonth(p.month);
      }
    }
  }, [isOpen, value, referenceStartDate]);

  // Formatted Spanish date label for trigger display
  const readableDate = useMemo(() => {
    const p = parseYMD(value);
    if (!p) return null;
    const dateObj = new Date(p.year, p.month, p.day);
    const weekday = WEEKDAY_NAMES[dateObj.getDay()];
    const month = MONTH_NAMES[p.month];
    return {
      full: `${weekday}, ${p.day} de ${month} del ${p.year}`,
      short: `${p.day} ${month.slice(0, 3)} ${p.year}`,
      dayNum: p.day,
      weekday,
      month,
      year: p.year,
    };
  }, [value]);

  // Contextual labels & texts for the trigger based on field type
  const isEndType = type === "end";
  const defaultPlaceholder = isEndType
    ? "¿Cuándo concluyen las consultas?"
    : "¿Qué día arranca la jornada?";

  const defaultSubtitle = isEndType
    ? referenceStartDate
      ? "Mismo día por defecto o extiende la fecha"
      : "Define la fecha de término del evento"
    : "Toca para definir la fecha de inicio";

  const triggerPlaceholder = placeholder || defaultPlaceholder;
  const triggerSubtitle = subtitle || defaultSubtitle;

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days grid for current viewMonth / viewYear
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        dayNum,
        month: m,
        year: y,
        ymd: formatYMD(y, m, dayNum),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        dayNum: d,
        month: viewMonth,
        year: viewYear,
        ymd: formatYMD(viewYear, viewMonth, d),
        isCurrentMonth: true,
      });
    }

    // Trailing days of next month to complete 42 or 35 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        dayNum: n,
        month: m,
        year: y,
        ymd: formatYMD(y, m, n),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDay = (ymd: string) => {
    onChange(ymd);
    setIsOpen(false);
  };

  // Check if a day is within range between referenceStartDate and value
  const isInRange = (ymd: string) => {
    if (!referenceStartDate || !value) return false;
    if (referenceStartDate === value) return false;
    return ymd >= referenceStartDate && ymd <= value;
  };

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {/* Label with contextual badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-[#9B0000]">*</span>}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
              isEndType
                ? "bg-[#9B0000]/15 text-[#f87171] border border-[#9B0000]/25"
                : "bg-[#006828]/20 text-[#4ade80] border border-[#006828]/30"
            }`}
          >
            {isEndType ? "Cierre" : "Inicio"}
          </span>
        </label>
        {readableDate && (
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {value}
          </span>
        )}
      </div>

      {/* Trigger Button - Distinctive and contextual for Inicio vs Cierre */}
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full bg-[#0a0a0a] border rounded-xl p-3 text-left cursor-pointer flex items-center justify-between gap-3 transition-all ${
          isOpen
            ? isEndType
              ? "border-[#9B0000] shadow-[0_0_15px_rgba(155,0,0,0.2)]"
              : "border-[#006828] shadow-[0_0_15px_rgba(0,104,40,0.2)]"
            : value
            ? "border-white/20 hover:border-white/30"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Distinctive Icon Badge */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isEndType
                ? value
                  ? "bg-[#9B0000]/20 text-[#f87171] border border-[#9B0000]/40"
                  : "bg-white/5 text-slate-400 border border-white/5"
                : value
                ? "bg-[#006828]/20 text-[#4ade80] border border-[#006828]/40"
                : "bg-white/5 text-slate-400 border border-white/5"
            }`}
          >
            {isEndType ? (
              <CalendarCheck className="w-5 h-5" />
            ) : (
              <CalendarIcon className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {readableDate ? (
              <>
                <p className="text-white text-sm font-semibold truncate capitalize">
                  {readableDate.full}
                </p>
                <div className="text-xs mt-0.5 flex items-center gap-1.5 truncate">
                  {isEndType ? (
                    referenceStartDate === value ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1 truncate">
                        <span>⚡</span>
                        <span>Jornada de 1 solo día (mismo día de inicio)</span>
                      </span>
                    ) : referenceStartDate && value > referenceStartDate ? (
                      <span className="text-blue-400 font-medium flex items-center gap-1 truncate">
                        <span>🎯</span>
                        <span>
                          Jornada de {getDaysDiff(referenceStartDate, value)} días de atención
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400 truncate">
                        Concluyen las consultas • {value}
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 truncate">
                      {value === todayYMD ? "Arranca hoy • " : "Arrancan consultas • "}
                      {value}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-sm font-medium truncate">
                  {triggerPlaceholder}
                </p>
                <p className="text-slate-500 text-xs mt-0.5 truncate">
                  {triggerSubtitle}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            {value
              ? isEndType && referenceStartDate === value
                ? "Extender"
                : "Cambiar"
              : isEndType
              ? "Elegir fin"
              : "Elegir inicio"}
          </button>
        </div>
      </div>

      {/* Hidden input to ensure HTML5 form validation checks */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required={required}
          className="opacity-0 absolute pointer-events-none h-0 w-0"
          tabIndex={-1}
        />
      )}

      {/* Interactive Calendar Modal / Bottom Sheet rendered via Portal to escape modal overflow clipping */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[70] flex flex-col justify-end md:justify-center items-center p-0 md:p-6 bg-black/80 backdrop-blur-sm">
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

                {/* Calendar Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-full max-w-md bg-[#161616] border border-white/15 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Decorative top accent */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      isEndType ? "bg-[#9B0000]" : "bg-[#006828]"
                    }`}
                  />

                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isEndType
                            ? "bg-[#9B0000]/20 border border-[#9B0000]/30 text-[#f87171]"
                            : "bg-[#006828]/20 border border-[#006828]/30 text-[#4ade80]"
                        }`}
                      >
                        {isEndType ? (
                          <CalendarCheck className="w-4 h-4" />
                        ) : (
                          <CalendarIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">
                          {isEndType ? "Fecha de Cierre (Término)" : "Fecha de Inicio (Arranque)"}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {readableDate
                            ? readableDate.full
                            : isEndType
                            ? "Selecciona el último día de la jornada"
                            : "Selecciona el primer día de la jornada"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Shortcut Buttons Row */}
                  <div className="p-3 bg-black/30 border-b border-white/5">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {referenceStartDate ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(referenceStartDate)}
                            className="text-xs px-3 py-1.5 rounded-full bg-[#006828]/20 border border-[#006828]/40 hover:bg-[#006828]/40 text-[#4ade80] font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>⚡</span> Mismo día (1 día)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(addDays(referenceStartDate, 1))}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            +1 día (2 días)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(addDays(referenceStartDate, 2))}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            +2 días (Fin de semana)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(addDays(referenceStartDate, 6))}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            +1 semana
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(todayYMD)}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            Hoy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(addDays(todayYMD, 1))}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            Mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(getNextWeekday(6))}
                            className="text-xs px-3 py-1.5 rounded-full bg-[#006828]/20 border border-[#006828]/40 hover:bg-[#006828]/40 text-[#4ade80] font-medium shrink-0 transition-all cursor-pointer"
                          >
                            Sábado próximo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDay(getNextWeekday(0))}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium shrink-0 transition-all cursor-pointer"
                          >
                            Domingo próximo
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Month & Year Navigation Header */}
                  <div className="px-5 pt-3 pb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                      <h5 className="text-base font-bold text-white">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={nextMonth}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Weekday Names Header */}
                  <div className="px-4 grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {WEEKDAY_SHORT.map((wd, i) => (
                      <div key={wd} className={i === 0 || i === 6 ? "text-[#006828]" : ""}>
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="px-4 pb-4 grid grid-cols-7 gap-1.5">
                    {calendarDays.map((cell) => {
                      const isSelected = cell.ymd === value;
                      const isToday = cell.ymd === todayYMD;
                      const isPastMin = minDate && cell.ymd < minDate;
                      const inRange = isInRange(cell.ymd);

                      return (
                        <button
                          key={cell.ymd}
                          type="button"
                          disabled={!!isPastMin}
                          onClick={() => handleSelectDay(cell.ymd)}
                          className={`h-10 rounded-xl text-sm font-semibold flex items-center justify-center relative transition-all cursor-pointer ${
                            isSelected
                              ? isEndType
                                ? "bg-[#9B0000] text-white shadow-[0_0_15px_rgba(155,0,0,0.6)] font-bold scale-105 z-10"
                                : "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.6)] font-bold scale-105 z-10"
                              : inRange
                              ? "bg-[#006828]/20 text-emerald-300 rounded-none first:rounded-l-xl last:rounded-r-xl"
                              : isPastMin
                              ? "text-slate-700 cursor-not-allowed opacity-30"
                              : cell.isCurrentMonth
                              ? "text-white hover:bg-white/10 active:scale-95"
                              : "text-slate-600 hover:bg-white/5"
                          }`}
                        >
                          <span>{cell.dayNum}</span>

                          {/* Subtle today indicator */}
                          {isToday && !isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006828] absolute bottom-1 left-1/2 -translate-x-1/2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer Bar */}
                  <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono">
                      {value || "Sin fecha seleccionada"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-1.5 text-white rounded-full font-bold text-xs transition-colors cursor-pointer ${
                        isEndType
                          ? "bg-[#9B0000] hover:bg-[#800000]"
                          : "bg-[#006828] hover:bg-[#00501f]"
                      }`}
                    >
                      Confirmar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
