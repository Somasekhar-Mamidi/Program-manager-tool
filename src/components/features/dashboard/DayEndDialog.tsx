"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Moon, Sparkles } from "lucide-react"
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

    // Can only end day if started
    if (!hasStarted) return null

    // If already ended, show summary
    if (hasEnded) return (
        <div className="flex flex-col gap-2 p-4 border rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex items-center gap-2 font-semibold text-lg text-indigo-700 dark:text-indigo-400">
                <Moon className="h-5 w-5" />
                <h3>Reflection Saved</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 text-base">
                <div>
                    <span className="font-semibold text-sm uppercase text-muted-foreground block mb-1">Wins:</span>
                    <p className="leading-relaxed">{summary.reflection?.wins}</p>
                </div>
                <div>
                    <span className="font-semibold text-sm uppercase text-muted-foreground block mb-1">Improvements:</span>
                    <p className="leading-relaxed">{summary.reflection?.improvements}</p>
                </div>
            </div>
        </div>
    )

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        updateDaySummary(today, {
            reflection: {
                wins: values.wins,
                blockers: values.blockers || "",
                improvements: values.improvements,
            }
        })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800 dark:hover:bg-indigo-950">
                    <Moon className="h-4 w-4" />
                    End Day Reflection
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Day Down. Time to Reflect.</DialogTitle>
                    <DialogDescription>
                        Review isn't about guilt. It's about data for tomorrow.
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

                        <DialogFooter>
                            <Button type="submit">Wrap Up Day</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
