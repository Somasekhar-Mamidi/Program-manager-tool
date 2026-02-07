"use client"

import React, { useMemo } from 'react'
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, differenceInMinutes, parse, startOfDay } from 'date-fns'
import { IntentBlock } from '@/types'
import { cn } from '@/lib/utils'
import { useCalendarStore } from '@/lib/store/calendar-store'

interface WeeklyCalendarGridProps {
    currentDate: Date
    onSelectDate?: (date: Date) => void
}

export function WeeklyCalendarGrid({ currentDate, onSelectDate }: WeeklyCalendarGridProps) {
    const { intents } = useCalendarStore()

    // Generate dates for the week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    // Filter events for this week with valid times
    const events = useMemo(() => {
        return intents.filter(intent => {
            if (!intent.date || !intent.startTime || !intent.endTime) return false
            const intentDate = parse(intent.date, 'yyyy-MM-dd', new Date())
            // Check if date is within the week
            return weekDays.some(day => isSameDay(day, intentDate))
        })
    }, [intents, weekDays])

    // Time slots (9 AM to 6 PM based on screenshot)
    const startHour = 9
    const endHour = 18
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

    // Calculate position and height
    const getEventStyle = (event: IntentBlock) => {
        if (!event.startTime || !event.endTime) return {}

        const start = parse(event.startTime, 'HH:mm', new Date())
        const end = parse(event.endTime, 'HH:mm', new Date())

        // Calculate minutes from start of grid (9 AM)
        const startMinutes = differenceInMinutes(start, setMinutes(setHours(new Date(), startHour), 0))
        const durationMinutes = differenceInMinutes(end, start)

        // 60px per hour => 1px per minute
        const top = (startMinutes / 60) * 60 + 20 // +20 for header offset
        const height = (durationMinutes / 60) * 60

        return {
            top: `${top}px`,
            height: `${height}px`
        }
    }

    const getCategoryColor = (category?: string) => {
        const colors: Record<string, string> = {
            'work': 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200',
            'meeting': 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200',
            'personal': 'bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200',
            'planning': 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200'
        }
        return colors[category || 'work'] || colors['work']
    }

    const getCurrentTimePosition = () => {
        const now = new Date()
        // Determine overlapping minutes from 9 AM
        const startOfGrid = setMinutes(setHours(now, startHour), 0)
        const diff = differenceInMinutes(now, startOfGrid)

        if (diff < 0 || diff > (endHour - startHour) * 60) return null
        return (diff / 60) * 60 + 20
    }

    const currentTimeTop = getCurrentTimePosition()

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden">
            {/* Header Row */}
            <div className="flex border-b">
                <div className="w-16 border-r bg-slate-50 flex-shrink-0" /> {/* Time column header */}
                <div className="flex-1 grid grid-cols-7 divide-x">
                    {weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={day.toISOString()} className="h-14 flex flex-col items-center justify-center bg-slate-50">
                                <span className={cn("text-xs font-semibold uppercase text-slate-500", isToday && "text-blue-600")}>
                                    {format(day, 'EEE')}
                                </span>
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mt-0.5",
                                    isToday ? "bg-blue-600 text-white" : "text-slate-900"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto relative">
                {/* Current Time Line */}
                {currentTimeTop && (
                    <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{ top: `${currentTimeTop}px` }}
                    >
                        <div className="w-16 flex justify-end pr-2">
                            <span className="text-xs font-bold text-red-500 bg-white px-1 rounded transform -translate-y-1/2">
                                {format(new Date(), 'HH:mm')}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-red-400 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 -ml-1"></div>
                        </div>
                    </div>
                )}

                <div className="flex min-h-[600px] relative">
                    {/* Time Column */}
                    <div className="w-16 border-r flex-shrink-0 bg-white">
                        {timeSlots.map((hour) => (
                            <div key={hour} className="h-[60px] border-b border-transparent relative">
                                <span className="absolute -top-2.5 right-2 text-xs text-slate-400">
                                    {format(setHours(new Date(), hour), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 grid grid-cols-7 divide-x relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 grid grid-rows-[repeat(9,60px)] z-0 pointer-events-none">
                            {timeSlots.map(t => <div key={t} className="border-b border-slate-100 w-full" />)}
                        </div>

                        {weekDays.map((day) => {
                            const dayEvents = events.filter(e => isSameDay(parse(e.date!, 'yyyy-MM-dd', new Date()), day))

                            return (
                                <div key={day.toISOString()} className="relative h-full z-10">
                                    {dayEvents.map(event => {
                                        const style = getEventStyle(event)
                                        return (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "absolute left-1 right-1 rounded-md px-2 py-1.5 border text-xs cursor-pointer shadow-sm transition-all hover:brightness-95",
                                                    getCategoryColor(event.calendarCategory)
                                                )}
                                                style={style}
                                            >
                                                <div className="font-semibold truncate leading-tight mb-0.5">
                                                    {event.objective}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-90 truncate text-[10px]">
                                                    <span className="font-medium">
                                                        {event.startTime && format(parse(event.startTime, 'HH:mm', new Date()), 'h:mm a')} - {event.endTime && format(parse(event.endTime, 'HH:mm', new Date()), 'h:mm a')}
                                                    </span>
                                                </div>
                                                {event.outputDefinition && (
                                                    <div className="mt-1 flex items-center gap-1 opacity-75">
                                                        <span className="text-[10px] truncate">★ {event.outputDefinition}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
