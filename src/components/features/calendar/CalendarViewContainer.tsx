"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { AddIntentDialog } from "./AddIntentDialog"
import { PageHeader } from "@/components/layout/PageHeader"
import { FullCalendarView } from "./FullCalendarView"
import FullCalendar from "@fullcalendar/react"

type ViewMode = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'

const viewLabels: Record<ViewMode, string> = {
    timeGridDay: 'Day',
    timeGridWeek: 'Week',
    dayGridMonth: 'Month',
}

export function CalendarViewContainer() {
    const [viewMode, setViewMode] = useState<ViewMode>('timeGridWeek')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [headerTitle, setHeaderTitle] = useState('')
    const calendarRef = useRef<FullCalendar>(null)

    const intents = useCalendarStore(state => state.intents)

    const handlePrevious = useCallback(() => {
        const api = calendarRef.current?.getApi()
        if (api) {
            api.prev()
            setCurrentDate(api.getDate())
            setHeaderTitle(api.view.title)
        }
    }, [])

    const handleNext = useCallback(() => {
        const api = calendarRef.current?.getApi()
        if (api) {
            api.next()
            setCurrentDate(api.getDate())
            setHeaderTitle(api.view.title)
        }
    }, [])

    const handleToday = useCallback(() => {
        const api = calendarRef.current?.getApi()
        if (api) {
            api.today()
            setCurrentDate(api.getDate())
            setHeaderTitle(api.view.title)
        }
    }, [])

    const handleViewChange = useCallback((newView: ViewMode) => {
        setViewMode(newView)
        const api = calendarRef.current?.getApi()
        if (api) {
            api.changeView(newView)
            setHeaderTitle(api.view.title)
        }
    }, [])

    return (
        <div className="flex flex-col h-full bg-background">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Calendar' }]}>
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
                        {headerTitle || format(currentDate, 'MMMM yyyy')}
                    </span>

                    {/* View Switcher */}
                    <div className="flex p-0.5 bg-muted rounded-lg border hidden md:flex">
                        {(Object.entries(viewLabels) as [ViewMode, string][]).map(([key, label]) => (
                            <Button
                                key={key}
                                variant={viewMode === key ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 px-2.5 text-xs"
                                onClick={() => handleViewChange(key)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    <div className="border-l pl-4 ml-2">
                        <AddIntentDialog date={currentDate} />
                    </div>
                </div>
            </PageHeader>

            {/* FullCalendar View */}
            <div className="flex-1 overflow-hidden p-4 lg:p-6 tour-calendar-view">
                <FullCalendarView
                    ref={calendarRef}
                    currentDate={currentDate}
                    viewMode={viewMode}
                />
            </div>
        </div>
    )
}
