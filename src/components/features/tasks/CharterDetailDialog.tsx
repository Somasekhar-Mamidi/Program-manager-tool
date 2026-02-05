import { useState } from "react"
import { Charter, MeetingResource, ResourceType } from "@/types"
import { useCalendarStore } from "@/lib/store/calendar-store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Plus,
    Trash2,
    Paperclip,
    ExternalLink,
    Upload,
    Eye,
    X,
    CheckCircle2,
    Download,
    Workflow
} from "lucide-react"
import { useTaskFlowStore, TaskPhase } from "@/lib/store/taskflow-store"
import { useRouter } from "next/navigation"

interface CharterDetailDialogProps {
    charter: Charter
    isOpen: boolean
    onClose: () => void
}

export function CharterDetailDialog({ charter, isOpen, onClose }: CharterDetailDialogProps) {
    const router = useRouter()
    const { updateCharter, intents, deleteIntent } = useCalendarStore()
    const { addTask, tasks: existingTasks, clearTasks } = useTaskFlowStore()
    const linkedTasks = intents.filter(i => i.charterId === charter.id)
    const [title, setTitle] = useState(charter.title)
    const [description, setDescription] = useState(charter.description)

    // Resource State
    const [isAddingResource, setIsAddingResource] = useState(false)
    const [resType, setResType] = useState<ResourceType>('link')
    const [resUrl, setResUrl] = useState("")
    const [resTitle, setResTitle] = useState("")
    const [resDesc, setResDesc] = useState("")
    const [previewResource, setPreviewResource] = useState<MeetingResource | null>(null)

    const resources = charter.resources || []

    const handleSavePrimary = () => {
        updateCharter(charter.id, { title, description })
        onClose()
    }

    const handleAddResource = () => {
        if (!resTitle.trim()) return

        const newResource: MeetingResource = {
            id: crypto.randomUUID(),
            type: resType,
            title: resTitle,
            url: resUrl,
            description: resDesc,
            createdAt: Date.now()
        }

        updateCharter(charter.id, {
            resources: [...resources, newResource]
        })

        // Reset
        setResTitle("")
        setResUrl("")
        setResDesc("")
        setIsAddingResource(false)
    }

    const deleteResource = (rId: string) => {
        const updated = resources.filter(r => r.id !== rId)
        updateCharter(charter.id, { resources: updated })
    }

    const handleSyncToTaskFlow = () => {
        // Simple mapping based on intent status
        if (linkedTasks.length === 0) {
            if (confirm("No linked tasks to visualize. Create empty task flow?")) {
                router.push("/task-flow")
                onClose()
            }
            return
        }

        // Clear existing board first as per user request
        clearTasks();

        // Stagger positions
        let startX = 100;
        let startY = 100;

        linkedTasks.forEach((intent, idx) => {
            {
                // Map Phase
                let phase: TaskPhase = 'TODO';
                if (intent.status === 'in-progress') phase = 'DOING';
                if (intent.status === 'completed') phase = 'DONE';

                // Initial position mapping based on phase (rough)
                let x = startX;
                if (phase === 'DOING') x = 500;
                if (phase === 'DONE') x = 900;

                // Stagger Y
                const y = startY + (idx * 120);

                addTask(intent.objective, phase, x, y);
            }
        });

        router.push("/task-flow")
        onClose()
    }

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case 'link': return <LinkIcon className="h-4 w-4" />
            case 'file': return <FileText className="h-4 w-4" />
            case 'image': return <ImageIcon className="h-4 w-4" />
            default: return <LinkIcon className="h-4 w-4" />
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Charter Details</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* Primary Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Charter Name</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Webinars, Event A"
                                    className="text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description / Objectives</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is the main goal of this charter?"
                                    className="h-24 resize-none"
                                />
                            </div>
                        </div>

                        {/* Resources Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Resources & Links
                                </h3>
                            </div>

                            {!isAddingResource ? (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => setIsAddingResource(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Attach Resource
                                </Button>
                            ) : (
                                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Type</Label>
                                            <Select
                                                value={resType}
                                                onValueChange={(val) => setResType(val as ResourceType)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="link">Link</SelectItem>
                                                    <SelectItem value="file">File (PDF/Doc)</SelectItem>
                                                    <SelectItem value="image">Image</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Title</Label>
                                            <Input
                                                placeholder="e.g. Q3 Roadmap"
                                                value={resTitle}
                                                onChange={e => setResTitle(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {resType === 'link' ? (
                                        <div className="space-y-1.5">
                                            <Label>URL</Label>
                                            <Input
                                                placeholder="https://..."
                                                value={resUrl}
                                                onChange={e => setResUrl(e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label>File Upload (Simulated)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    className="cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            // Limit file size to ~2MB for localStorage safety
                                                            if (file.size > 2 * 1024 * 1024) {
                                                                alert("File is too large for local demo storage (Max 2MB).")
                                                                return;
                                                            }

                                                            setResTitle(file.name)

                                                            // Convert to Base64 for persistence
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const base64 = reader.result as string;
                                                                setResUrl(base64);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                *Local file reference only. File name will be saved.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label>Description (Optional)</Label>
                                        <Textarea
                                            placeholder="Brief context..."
                                            className="h-16"
                                            value={resDesc}
                                            onChange={e => setResDesc(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsAddingResource(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleAddResource}
                                            disabled={!resTitle}
                                        >
                                            Add Resource
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {resources.length === 0 && !isAddingResource && (
                                    <div className="text-center py-6 text-muted-foreground/60 italic text-sm">
                                        No resources attached yet.
                                    </div>
                                )}

                                {resources.map(res => (
                                    <div key={res.id} className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                                        <div className="mt-1 p-2 rounded-md bg-muted text-muted-foreground">
                                            {getResourceIcon(res.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="font-medium hover:underline cursor-pointer flex items-center gap-1"
                                                    onClick={() => {
                                                        if (res.type === 'link') {
                                                            window.open(res.url, '_blank')
                                                        } else {
                                                            setPreviewResource(res)
                                                        }
                                                    }}
                                                >
                                                    {res.title}
                                                    {res.type === 'link' ? <ExternalLink className="h-3 w-3" /> : <Eye className="h-3 w-3 opacity-50" />}
                                                </span>
                                            </div>
                                            {res.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {res.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteResource(res.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Linked Tasks
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {linkedTasks.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground/60 italic text-sm">
                                        No tasks linked to this charter.
                                    </div>
                                ) : (
                                    linkedTasks.map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card group">
                                            <div>
                                                <p className="font-medium text-sm">{task.objective}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {task.status} • {new Date(task.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this task?")) {
                                                        deleteIntent(task.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-between gap-2 mt-auto">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                // Sync logic
                                // We need to dynamic import or use hook at top level?
                                // Let's use the hook inside component, but we need to add it to imports first.
                                // See below for imports.
                                handleSyncToTaskFlow();
                            }}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                        >
                            <Workflow className="h-4 w-4 mr-2" />
                            Visualize Flow
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Close</Button>
                            <Button onClick={handleSavePrimary}>Save Changes</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Preview Dialog */}
            {
                previewResource && (
                    <Dialog open={!!previewResource} onOpenChange={(open) => !open && setPreviewResource(null)}>
                        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-2">
                                    {getResourceIcon(previewResource.type)}
                                    <h3 className="font-semibold">{previewResource.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {previewResource.url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={previewResource.url} download={previewResource.title} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => setPreviewResource(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 bg-muted/20 overflow-auto flex items-center justify-center p-4">
                                {previewResource.type === 'image' ? (
                                    <img
                                        src={previewResource.url}
                                        alt={previewResource.title}
                                        className="max-w-full max-h-full object-contain shadow-lg rounded"
                                    />
                                ) : (
                                    <iframe
                                        src={previewResource.url}
                                        className="w-full h-full border-0 bg-white shadow-sm rounded"
                                        title={previewResource.title}
                                    />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            }
        </>
    )
}
