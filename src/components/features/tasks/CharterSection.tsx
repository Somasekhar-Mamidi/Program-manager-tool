import { useState } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Charter } from "@/types"
import { Plus, Trash2, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CharterDetailDialog } from "./CharterDetailDialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CharterSection() {
    const { charters, addCharter, deleteCharter } = useCalendarStore()
    const [selectedCharter, setSelectedCharter] = useState<Charter | null>(null)

    const handleCreateCharter = () => {
        const title = prompt("Enter Charter Name:")
        if (title?.trim()) {
            addCharter({
                title: title.trim(),
                description: "",
            })
        }
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Charters</h2>
                        <p className="text-sm text-muted-foreground">High-level initiatives and active workstreams.</p>
                    </div>
                </div>
                <Button onClick={handleCreateCharter} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Charter
                </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {/* Horizontal List */}
                {(!charters || charters.length === 0) && (
                    <div className="flex flex-col items-center justify-center min-w-[200px] h-[120px] border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm">
                        <p>No active charters.</p>
                        <Button variant="link" onClick={handleCreateCharter} className="h-auto p-0">Create one</Button>
                    </div>
                )}

                {(charters || []).map(charter => (
                    <div
                        key={charter.id}
                        onClick={() => setSelectedCharter(charter)}
                        className="group relative flex-shrink-0 w-[240px] h-[140px] cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <Card className="h-full hover:shadow-md border-2 hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 h-full flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2">
                                        {charter.title}
                                    </h3>
                                    {charter.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {charter.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <Badge variant="secondary" className="text-[10px]">
                                        {(charter.resources || []).length} Resources
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delete Action (Top Right) */}
                        <div
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-white shadow-sm">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => deleteCharter(charter.id)}
                                    >
                                        Delete Charter
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>

            {selectedCharter && (
                <CharterDetailDialog
                    charter={selectedCharter}
                    isOpen={!!selectedCharter}
                    onClose={() => setSelectedCharter(null)}
                />
            )}
        </div>
    )
}
