"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { useState, useEffect } from "react"
import { IntentBlock } from "@/types"

const formSchema = z.object({
    objective: z.string().min(2, {
        message: "Objective must be at least 2 characters.",
    }),
    outputDefinition: z.string().min(5, {
        message: "Definition of done must be clear (min 5 chars).",
    }),
    estimatedEffort: z.enum(["low", "medium", "high"]),
    type: z.enum(["work", "social"]),
    isMeeting: z.boolean(),
    isTaskResource: z.boolean().optional(),
    scheduledTime: z.string().optional(),
    date: z.date(),
}).refine(data => !data.isMeeting || !!data.scheduledTime, {
    message: "Time is required for meetings",
    path: ["scheduledTime"],
})

interface AddIntentDialogProps {
    date: Date
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    intent?: IntentBlock
    onSuccess?: () => void
    isTaskResource?: boolean // New prop
}

export function AddIntentDialog({ date, children, open, onOpenChange, intent, onSuccess, isTaskResource }: AddIntentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Handle both controlled and uncontrolled modes
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : internalOpen
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen

    const addIntent = useCalendarStore((state) => state.addIntent)
    const updateIntent = useCalendarStore((state) => state.updateIntent)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: intent?.objective || "",
            outputDefinition: intent?.outputDefinition || "",
            estimatedEffort: (intent?.estimatedEffort as "low" | "medium" | "high") || "medium",
            type: (intent?.type as "work" | "social") || "work",
            isMeeting: intent?.isMeeting || false,
            isTaskResource: intent?.isTaskResource || isTaskResource || false, // Default from prop
            scheduledTime: intent?.scheduledTime || "",
            date: intent ? new Date(intent.date) : date,
        },
    })

    // Reset form when intent or date changes
    useEffect(() => {
        if (isOpen) {
            form.reset({
                objective: intent?.objective || "",
                outputDefinition: intent?.outputDefinition || "",
                estimatedEffort: (intent?.estimatedEffort as "low" | "medium" | "high") || "medium",
                type: (intent?.type as "work" | "social") || "work",
                isMeeting: intent?.isMeeting || false,
                isTaskResource: intent?.isTaskResource || isTaskResource || false,
                scheduledTime: intent?.scheduledTime || "",
                date: intent ? new Date(intent.date) : date,
            })
        }
    }, [intent, date, isOpen, form, isTaskResource])

    function onSubmit(values: z.infer<typeof formSchema>) {
        const intentData = {
            date: format(values.date, 'yyyy-MM-dd'),
            objective: values.objective,
            outputDefinition: values.outputDefinition,
            estimatedEffort: values.estimatedEffort,
            type: values.type,
            isMeeting: values.isMeeting,
            isTaskResource: values.isTaskResource, // Pass to store
            scheduledTime: values.scheduledTime,
        }

        if (intent) {
            updateIntent(intent.id, intentData)
        } else {
            addIntent(intentData)
        }

        if (!intent) {
            form.reset({
                objective: "",
                outputDefinition: "",
                estimatedEffort: "medium",
                type: "work",
                isMeeting: false,
                scheduledTime: "",
                date: date
            })
        }

        setIsOpen?.(false)
        if (onSuccess) onSuccess()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            {children || <Button>{intent ? "Edit Intent" : "Add Intent"}</Button>}
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">
                            An Intent is a commitment to an <strong>outcome</strong>, not just a time block.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{intent ? "Edit Intent / Meeting" : "Set Intent / Schedule Meeting"}</DialogTitle>
                    <DialogDescription>
                        Focus on outcomes, not just time. What will you achieve?
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="objective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objective</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Draft Q1 Marketing Plan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="outputDefinition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Output Definition (Done looks like...)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., 5-page Google Doc shared with team"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estimatedEffort"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Effort</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select effort" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low (&#60; 30m)</SelectItem>
                                                <SelectItem value="medium">Medium (1-2h)</SelectItem>
                                                <SelectItem value="high">High (2h+)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="work">Work Execution</SelectItem>
                                                <SelectItem value="social">Social Content</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20">
                            <FormField
                                control={form.control}
                                name="isMeeting"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Is this a fixed meeting?</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Enable to set a time/date and get prep alerts.
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {form.watch("isMeeting") && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="scheduledTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time (24h)</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit">{intent ? "Update Intent" : "Set Intent"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
