"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Moon, Sparkles, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    wins: z.string().min(1, "Even a small win counts."),
    blockers: z.string().optional(),
    improvements: z.string().min(1, "One thing to improve."),
})

export function DayEndDialog() {
    const [open, setOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const today = format(new Date(), 'yyyy-MM-dd')

    const { daySummaries, updateDaySummary } = useCalendarStore()

    const summary = daySummaries[today]
    const hasStarted = !!summary?.topOutcomes?.length
    const hasEnded = !!summary?.reflection

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            wins: "",
            blockers: "",
            improvements: "",
        },
    })

    // Pre-populate form with existing reflection when entering edit mode
    useEffect(() => {
        if (isEditing && summary?.reflection) {
            form.reset({
                wins: summary.reflection.wins || "",
                blockers: summary.reflection.blockers || "",
                improvements: summary.reflection.improvements || "",
            })
        }
    }, [isEditing, summary?.reflection, form])

    // Can only end day if started
    if (!hasStarted) return null

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        updateDaySummary(today, {
            reflection: {
                wins: values.wins,
                blockers: values.blockers || "",
                improvements: values.improvements,
            }
        })
        setIsEditing(false)
        setOpen(false)
    }

    const handleClearReflection = () => {
        updateDaySummary(today, {
            reflection: undefined
        })
        form.reset({ wins: "", blockers: "", improvements: "" })
        setIsEditing(false)
        setOpen(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setIsEditing(false)
            form.reset({ wins: "", blockers: "", improvements: "" })
        }
    }

    const handleEditClick = () => {
        setIsEditing(true)
    }

    // Show "Reflection" button if already ended, or "End Day Reflection" button if not
    const triggerButton = hasEnded ? (
        <Button variant="outline" size="sm" className="gap-2 h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/20">
            <Sparkles className="h-3.5 w-3.5" />
            Reflection
        </Button>
    ) : (
        <Button variant="outline" size="sm" className="gap-2 h-8 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800 dark:hover:bg-indigo-950">
            <Moon className="h-3.5 w-3.5" />
            End Day
        </Button>
    )

    // Reflection form (used for both new and edit)
    const reflectionForm = (
        <>
            <DialogHeader>
                <DialogTitle>
                    {hasEnded ? "Edit Reflection" : "Day Down. Time to Reflect."}
                </DialogTitle>
                <DialogDescription>
                    {hasEnded
                        ? "Update your reflection with new notes or changes."
                        : "Review isn't about guilt. It's about data for tomorrow."}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="wins"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What actually moved forward today?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="List your wins, however small..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="blockers"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What got you stuck? (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Distractions, unclear tasks, tech issues..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="improvements"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What can you simplify tomorrow?</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="One adjustment to make..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter className="gap-2">
                        {hasEnded && (
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="mr-auto">
                                Cancel
                            </Button>
                        )}
                        <Button type="submit">
                            {hasEnded ? "Save Changes" : "Wrap Up Day"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </>
    )

    // Read-only view of existing reflection
    const reflectionView = (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    Today's Reflection
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                    <span className="font-semibold text-xs uppercase text-muted-foreground block mb-1">Wins:</span>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary?.reflection?.wins}</p>
                </div>
                {summary?.reflection?.blockers && (
                    <div>
                        <span className="font-semibold text-xs uppercase text-muted-foreground block mb-1">Blockers:</span>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary?.reflection?.blockers}</p>
                    </div>
                )}
                <div>
                    <span className="font-semibold text-xs uppercase text-muted-foreground block mb-1">Improvements:</span>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary?.reflection?.improvements}</p>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearReflection}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto gap-1.5"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                </Button>
                <Button type="button" variant="outline" onClick={handleEditClick} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </Button>
            </DialogFooter>
        </>
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                {hasEnded && !isEditing ? reflectionView : reflectionForm}
            </DialogContent>
        </Dialog>
    )
}
