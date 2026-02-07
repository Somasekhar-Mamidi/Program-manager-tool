"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"

interface PageHeaderProps {
    items: { label: string, href?: string }[]
    children?: React.ReactNode // Toolbar actions
    className?: string
}

export function PageHeader({ items, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between h-14 border-b bg-background/95 backdrop-blur px-4 lg:px-6 shrink-0", className)}>
            {/* Breadcrumbs / Title Area */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <SidebarTrigger className="-ml-2 mr-1" />
                <div className="h-4 w-px bg-slate-200 mx-1" />
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                        <span className={cn(
                            index === items.length - 1 ? "text-foreground font-semibold" : "hover:text-foreground transition-colors cursor-default"
                        )}>
                            {item.label}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            {/* Toolbar Area */}
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    )
}
