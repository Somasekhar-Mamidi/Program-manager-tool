"use client"

import { useCallback, useMemo, forwardRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventContentArg, EventDropArg, EventClickArg } from "@fullcalendar/core"
import type { EventResizeDoneArg } from "@fullcalendar/interaction"
import { format, parse } from "date-fns"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlock } from "@/types"
import "@/styles/fullcalendar-theme.css"

interface FullCalendarViewProps {
    currentDate: Date
    viewMode: "timeGridDay" | "timeGridWeek" | "dayGridMonth"
    onDateChange?: (date: Date) => void
    onEventClick?: (intent: IntentBlock) => void
}

// Category → CSS class mapping
function getCategoryClass(intent: IntentBlock): string {
    if (intent.isMeeting) return "fc-event-meeting"
    const cat = intent.calendarCategory?.toLowerCase()
    if (cat === "meeting") return "fc-event-meeting"
    if (cat === "personal") return "fc-event-personal"
    if (cat === "planning") return "fc-event-planning"
    if (cat === "work") return "fc-event-work"
    return "fc-event-default"
}

export const FullCalendarView = forwardRef<FullCalendar, FullCalendarViewProps>(
    function FullCalendarView({ currentDate, viewMode, onDateChange, onEventClick }, ref) {
        const { intents, updateIntent } = useCalendarStore()

        // Convert IntentBlock[] → FullCalendar events
        const events = useMemo(() => {
            return intents
                .filter(i => i.date)
                .map(intent => {
                    const hasTime = intent.startTime && intent.endTime

                    if (hasTime) {
                        // Timed event
                        return {
                            id: intent.id,
                            title: intent.objective,
                            start: `${intent.date}T${intent.startTime}`,
                            end: `${intent.date}T${intent.endTime}`,
                            allDay: false,
                            classNames: [getCategoryClass(intent)],
                            extendedProps: { intent }
                        }
                    } else {
                        // All-day event (no time set)
                        return {
                            id: intent.id,
                            title: intent.objective,
                            start: intent.date,
                            allDay: true,
                            classNames: [getCategoryClass(intent)],
                            extendedProps: { intent }
                        }
                    }
                })
        }, [intents])

        // Custom event rendering
        const renderEventContent = useCallback((arg: EventContentArg) => {
            const intent = arg.event.extendedProps.intent as IntentBlock
            const isTimedView = arg.view.type.includes("timeGrid")

            return (
                <div className="w-full h-full p-0">
                    <div className="fc-event-title-custom">{intent.objective}</div>
                    {isTimedView && intent.startTime && intent.endTime && (
                        <div className="fc-event-time-custom">
                            {format(parse(intent.startTime, 'HH:mm', new Date()), 'h:mm a')} – {format(parse(intent.endTime, 'HH:mm', new Date()), 'h:mm a')}
                        </div>
                    )}
                    {isTimedView && intent.outputDefinition && intent.outputDefinition !== 'Task from Start Ritual' && (
                        <div className="fc-event-detail-custom">★ {intent.outputDefinition}</div>
                    )}
                </div>
            )
        }, [])

        // Handle event drag & drop (reschedule)
        const handleEventDrop = useCallback((info: EventDropArg) => {
            const intent = info.event.extendedProps.intent as IntentBlock
            const newDate = format(info.event.start!, 'yyyy-MM-dd')

            const updates: Partial<IntentBlock> = { date: newDate }

            if (!info.event.allDay && info.event.start && info.event.end) {
                updates.startTime = format(info.event.start, 'HH:mm')
                updates.endTime = format(info.event.end, 'HH:mm')
            }

            updateIntent(intent.id, updates)
        }, [updateIntent])

        // Handle event resize (change duration)
        const handleEventResize = useCallback((info: EventResizeDoneArg) => {
            const intent = info.event.extendedProps.intent as IntentBlock

            if (info.event.end) {
                updateIntent(intent.id, {
                    endTime: format(info.event.end, 'HH:mm')
                })
            }
        }, [updateIntent])

        // Handle event click
        const handleEventClick = useCallback((info: EventClickArg) => {
            const intent = info.event.extendedProps.intent as IntentBlock
            onEventClick?.(intent)
        }, [onEventClick])

        return (
            <div className="h-full w-full rounded-xl border bg-card overflow-hidden shadow-sm">
                <FullCalendar
                    ref={ref}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={viewMode}
                    initialDate={currentDate}
                    events={events}
                    eventContent={renderEventContent}
                    headerToolbar={false}
                    height="100%"
                    // Time grid settings
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    nowIndicator={true}
                    allDaySlot={true}
                    allDayText="All Day"
                    // Week settings
                    firstDay={1}
                    weekends={true}
                    dayMaxEvents={3}
                    // Interactions
                    editable={true}
                    eventDurationEditable={true}
                    eventStartEditable={true}
                    droppable={false}
                    selectable={false}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventClick={handleEventClick}
                    // Formatting
                    dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                    slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                />
            </div>
        )
    })
