"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PenTool, Construction } from "lucide-react"

export default function WritingPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Writing Desk</h1>
                <p className="text-muted-foreground">Focus mode for your daily writing and content creation.</p>
            </div>

            <Card className="border-dashed bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <PenTool className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Under Construction</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            The Writing Module is coming next! It will feature streak tracking,
                            prompt generators, and distraction-free writing zones.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
