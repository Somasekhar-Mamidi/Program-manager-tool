"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutList, CalendarRange } from "lucide-react"
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns"
import { DayView } from "@/components/features/calendar/DayView"
import { WeeklyCalendarGrid } from "@/components/features/calendar/WeeklyCalendarGrid"
import { MonthView } from "@/components/features/calendar/MonthView"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { AddIntentDialog } from "./AddIntentDialog"
import { PageHeader } from "@/components/layout/PageHeader"

type ViewMode = 'day' | 'week' | 'month'

export function CalendarViewContainer() {
    const [viewMode, setViewMode] = useState<ViewMode>('week')
    // Default to Mock Data week (Oct 28, 2024 (Monday)) for demonstration purposes to match the screenshot
    const [currentDate, setCurrentDate] = useState(new Date('2024-10-28T09:00:00'))

    // We import intents here just to pass to views if needed, though WeeklyGrid uses store directly mostly
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
        setCurrentDate(new Date()) // This returns to "real" today
    }

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date)
        setViewMode('day')
    }

    const headerTitle = {
        day: format(currentDate, 'MMMM d, yyyy'),
        week: `Week of ${format(currentDate, 'MMM d, yyyy')}`,
        month: format(currentDate, 'MMMM yyyy'),
    }[viewMode]

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Calendar' }]}>
                {/* Toolbar Actions */}
                <div className="flex items-center gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 font-medium" onClick={handleToday}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <span className="text-sm font-semibold min-w-[170px] text-center hidden md:block">
                        {headerTitle}
                    </span>

                    {/* View Switcher */}
                    <div className="flex p-0.5 bg-muted rounded-lg border hidden md:flex">
                        <Button
                            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </Button>
                        <Button
                            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </Button>
                    </div>

                    <div className="border-l pl-4 ml-2">
                        <AddIntentDialog date={currentDate} />
                    </div>
                </div>
            </PageHeader>

            {/* View Content */}
            <div className="flex-1 overflow-auto p-4 lg:p-6 w-full max-w-[1800px] mx-auto">
                {viewMode === 'day' && (
                    <DayView currentDate={currentDate} />
                )}
                {viewMode === 'week' && (
                    <WeeklyCalendarGrid
                        currentDate={currentDate}
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
