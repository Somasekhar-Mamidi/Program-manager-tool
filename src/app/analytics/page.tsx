"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Construction } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Detailed insights into your productivity and consistency.</p>
            </div>

            <Card className="border-dashed bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Construction className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            The advanced analytics module is currently under construction.
                            Check the Dashboard for your daily stats and streaks!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
