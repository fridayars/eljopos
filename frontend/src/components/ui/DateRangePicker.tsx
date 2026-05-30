import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
    className?: string;
}

export function DateRangePicker({ startDate, endDate, onDateChange, className = '' }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial dates or fallback to today
    const parseDate = (d: string) => {
        if (!d) return new Date();
        const parts = d.split('-');
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const initialStart = parseDate(startDate);
    const initialEnd = parseDate(endDate);

    const [currentMonth, setCurrentMonth] = useState(initialStart);

    // Selection state
    const [tempStart, setTempStart] = useState<Date | null>(initialStart);
    const [tempEnd, setTempEnd] = useState<Date | null>(initialEnd);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [step, setStep] = useState<'start' | 'end'>('start');

    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Format for display
    const formatDateDisplay = (d: Date | null) => {
        if (!d) return 'Pilih Tanggal';
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatToYYYYMMDD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Calendar generation
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Start on Monday
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const prevMonthDays = Array.from({ length: firstDay }, (_, i) => i);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (step === 'start') {
            setTempStart(clickedDate);
            setTempEnd(null);
            setStep('end');
        } else {
            if (tempStart && clickedDate < tempStart) {
                setTempStart(clickedDate);
                setTempEnd(null);
                setStep('end');
            } else {
                setTempEnd(clickedDate);
                setStep('start');
                setIsOpen(false);
                if (tempStart) {
                    onDateChange(formatToYYYYMMDD(tempStart), formatToYYYYMMDD(clickedDate));
                }
            }
        }
    };

    const isDateSelected = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const startStr = tempStart ? formatToYYYYMMDD(tempStart) : null;
        const endStr = tempEnd ? formatToYYYYMMDD(tempEnd) : null;
        const dateStr = formatToYYYYMMDD(date);
        return dateStr === startStr || dateStr === endStr;
    };

    const isDateInRange = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (tempStart && tempEnd) {
            return date.getTime() > tempStart.getTime() && date.getTime() < tempEnd.getTime();
        }
        if (tempStart && hoverDate && step === 'end') {
            const min = Math.min(tempStart.getTime(), hoverDate.getTime());
            const max = Math.max(tempStart.getTime(), hoverDate.getTime());
            return date.getTime() > min && date.getTime() < max;
        }
        return false;
    };

    // For sync when props change from outside
    useEffect(() => {
        if (!isOpen) {
            setTempStart(parseDate(startDate));
            setTempEnd(parseDate(endDate));
            setStep('start');
        }
    }, [startDate, endDate, isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-purple-500/10 cursor-pointer hover:border-purple-500/30 transition-all text-sm min-w-[240px]"
            >
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                <div className="flex-1 text-center text-gray-200 font-medium tracking-wide">
                    {formatDateDisplay(parseDate(startDate))} <span className="text-purple-400 font-bold px-1">—</span> {formatDateDisplay(parseDate(endDate))}
                </div>
            </div>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 top-full right-0 mt-2 p-4 bg-[#1A1A24]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_10px_40px_rgba(139,92,246,0.2)] w-[320px]"
                    >
                        {/* Header info */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                {step === 'start' ? 'Pilih Start Date' : 'Pilih End Date'}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-gray-200">
                                {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                                <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-y-1">
                            {prevMonthDays.map((_, i) => (
                                <div key={`prev-${i}`} className="h-8" />
                            ))}
                            {days.map((day) => {
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const isSelected = isDateSelected(day);
                                const inRange = isDateInRange(day);

                                const dateStr = formatToYYYYMMDD(date);
                                const startStr = tempStart ? formatToYYYYMMDD(tempStart) : null;
                                const endStr = tempEnd ? formatToYYYYMMDD(tempEnd) : null;
                                const hoverStr = hoverDate ? formatToYYYYMMDD(hoverDate) : null;

                                let isLeftEdge = false;
                                let isRightEdge = false;

                                if (tempStart && tempEnd) {
                                    if (dateStr === startStr) isLeftEdge = true;
                                    if (dateStr === endStr) isRightEdge = true;
                                } else if (step === 'end' && tempStart && hoverDate) {
                                    const tStart = tempStart.getTime();
                                    const tHover = hoverDate.getTime();
                                    if (tHover > tStart) {
                                        if (dateStr === startStr) isLeftEdge = true;
                                        if (dateStr === hoverStr) isRightEdge = true;
                                    } else if (tHover < tStart) {
                                        if (dateStr === hoverStr) isLeftEdge = true;
                                        if (dateStr === startStr) isRightEdge = true;
                                    }
                                }

                                return (
                                    <div
                                        key={day}
                                        className={`relative flex items-center justify-center h-8 cursor-pointer text-sm
                                            ${inRange ? 'bg-cyan-500/40' : ''}
                                            ${isLeftEdge ? 'rounded-l-lg bg-cyan-500/40' : ''}
                                            ${isRightEdge ? 'rounded-r-lg bg-cyan-500/40' : ''}
                                        `}
                                        onClick={() => handleDateClick(day)}
                                        onPointerEnter={() => {
                                            setHoverDate(date);
                                        }}
                                    >
                                        <div className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all
                                            ${isSelected ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)] z-10'
                                                : dateStr === hoverStr && step === 'end' ? 'bg-cyan-500/60 text-white font-bold z-10'
                                                    : 'text-gray-300 hover:bg-white/10'}
                                        `}>
                                            {day}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
