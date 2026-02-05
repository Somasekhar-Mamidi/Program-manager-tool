"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutList, CalendarRange } from "lucide-react"
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns"
import { DayView } from "@/components/features/calendar/DayView"
import { WeekView } from "@/components/features/calendar/WeekView"
import { MonthView } from "@/components/features/calendar/MonthView"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { AddIntentDialog } from "./AddIntentDialog"

type ViewMode = 'day' | 'week' | 'month'

export function CalendarViewContainer() {
    const [viewMode, setViewMode] = useState<ViewMode>('day')
    const [currentDate, setCurrentDate] = useState(new Date())
    const intents = useCalendarStore(state => state.intents)

    const handlePrevious = () => {
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1))
        if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1))
    }

    const handleNext = () => {
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
        if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date)
        setViewMode('day') // Switch to day view when clicking a day in month/week
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
                        {viewMode === 'week' && `Week of ${format(currentDate, 'MMM d')}`}
                        {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/40 ml-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleToday}
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* View Switcher */}
                    <div className="flex p-1 bg-muted rounded-lg border">
                        <Button
                            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 gap-2 px-3"
                            onClick={() => setViewMode('day')}
                        >
                            <LayoutList className="h-4 w-4" />
                            <span className="hidden sm:inline">Day</span>
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 gap-2 px-3"
                            onClick={() => setViewMode('week')}
                        >
                            <CalendarRange className="h-4 w-4" />
                            <span className="hidden sm:inline">Week</span>
                        </Button>
                        <Button
                            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 gap-2 px-3"
                            onClick={() => setViewMode('month')}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Month</span>
                        </Button>
                    </div>

                    <div className="ml-auto sm:ml-2">
                        <AddIntentDialog date={currentDate} />
                    </div>
                </div>
            </div>

            {/* View Content */}
            <div className="min-h-[600px]">
                {viewMode === 'day' && (
                    <DayView currentDate={currentDate} />
                )}
                {viewMode === 'week' && (
                    <WeekView
                        currentDate={currentDate}
                        intents={intents}
                        onSelectDate={handleDateSelect}
                    />
                )}
                {viewMode === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        intents={intents}
                        onSelectDate={handleDateSelect}
                    />
                )}
            </div>
        </div>
    )
}
