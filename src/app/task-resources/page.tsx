"use client"

import { useCalendarStore } from "@/lib/store/calendar-store"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/storage"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import DOMPurify from 'isomorphic-dompurify';
import {
    CalendarClock,
    Plus,
    Trash2,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Star,
    Brain,
    History as HistoryIcon,
    LayoutGrid,
    List,
    Tag,
    Layers
} from "lucide-react"
import { useState } from "react"
import { IntentBlock, MeetingQuestion, MeetingResource, ResourceType, MeetingNoteItem } from "@/types"
import { cn } from "@/lib/utils"
import { AddIntentDialog } from "@/components/features/calendar/AddIntentDialog"
import { PageHeader } from "@/components/layout/PageHeader"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { MoreVertical, Paperclip, Link as LinkIcon, FileText, Image as ImageIcon, ChevronUp, ChevronDown, PenTool, ListTodo, GripVertical, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { compressImageToBlob } from "@/lib/image-compression"
import { uploadFileToStorage } from "@/lib/supabase-upload"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
    () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
    { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted/20 rounded-md" /> }
)
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";



export default function TaskResourcesPage() {
    const { intents, reorderIntents } = useCalendarStore()
    const [isAddResourceOpen, setIsAddResourceOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

    // Filter for only Task Resources
    const taskResources = intents
        .filter(i => i.isTaskResource)
        .sort((a, b) => {
            // Priority: Order field -> Date -> Time
            if (typeof a.order === 'number' && typeof b.order === 'number') {
                return a.order - b.order;
            }
            if (typeof a.order === 'number') return -1;
            if (typeof b.order === 'number') return 1;

            // Sort by date then time
            const dateCompare = a.date.localeCompare(b.date)
            if (dateCompare !== 0) return dateCompare
            return (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
        })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = activeResources.findIndex((item) => item.id === active.id);
            const newIndex = activeResources.findIndex((item) => item.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(activeResources, oldIndex, newIndex);
                reorderIntents(newOrder.map(m => m.id));
            }
        }
    };

    // Separate filtered lists
    const activeResources = taskResources.filter(m => m.status !== 'completed' && (!isPast(new Date(m.date)) || isToday(new Date(m.date))))
    const pastResources = taskResources.filter(m => m.status === 'completed' || (isPast(new Date(m.date)) && !isToday(new Date(m.date))))

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Task Resources' }]}>
                <AddIntentDialog date={new Date()} open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen} isTaskResource={true}>
                    <Button size="sm" className="gap-2 h-8">
                        <Plus className="h-4 w-4" />
                        Add Task Resource
                    </Button>
                </AddIntentDialog>
            </PageHeader>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-8 max-w-5xl mx-auto">


                    <Tabs defaultValue="active" className="w-full">
                        <div className="flex items-center justify-between mb-8">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="active">Active ({activeResources.length})</TabsTrigger>
                                <TabsTrigger value="past">Completed ({pastResources.length})</TabsTrigger>
                            </TabsList>

                            <div className="flex bg-muted p-1 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 px-2", viewMode === 'list' && "bg-background shadow-sm")}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 px-2", viewMode === 'grid' && "bg-background shadow-sm")}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="active">
                            {activeResources.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">No Active Task Resources</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Add a task resource to get started.
                                    </p>
                                    <div className="mt-6">
                                        <AddIntentDialog date={new Date()} open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen} isTaskResource={true}>
                                            <Button size="lg" variant="outline" className="gap-2">
                                                <Plus className="h-5 w-5" />
                                                Add Task Resource
                                            </Button>
                                        </AddIntentDialog>
                                    </div>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={activeResources.map(m => m.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className={cn(
                                            "grid gap-6",
                                            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                                        )}>
                                            {activeResources.map(resource => (
                                                <SortableMeetingItem key={resource.id} id={resource.id} viewMode={viewMode}>
                                                    {viewMode === 'grid' ? (
                                                        <CompactMeetingCard
                                                            meeting={resource}
                                                            onClick={() => setSelectedResourceId(resource.id)}
                                                        />
                                                    ) : (
                                                        <MeetingPrepCard meeting={resource} upcomingMeetings={activeResources} />
                                                    )}
                                                </SortableMeetingItem>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </TabsContent>

                        <TabsContent value="past">
                            {pastResources.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                                    <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">No Completed Items</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Completed items will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid gap-6",
                                    viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                                )}>
                                    {pastResources.map(resource => (
                                        viewMode === 'grid' ? (
                                            <CompactMeetingCard
                                                key={resource.id}
                                                meeting={resource}
                                                onClick={() => setSelectedResourceId(resource.id)}
                                                isReadOnly={true}
                                            />
                                        ) : (
                                            <MeetingPrepCard key={resource.id} meeting={resource} isReadOnly={true} upcomingMeetings={activeResources} />
                                        )
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                </div>
            </div>

            <Dialog open={!!selectedResourceId} onOpenChange={(open) => !open && setSelectedResourceId(null)}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Details</DialogTitle>
                    </DialogHeader>
                    {selectedResourceId && (
                        (() => {
                            const resource = taskResources.find(m => m.id === selectedResourceId)
                            if (!resource) return null
                            return <MeetingPrepCard meeting={resource} isReadOnly={resource.status === 'completed'} upcomingMeetings={activeResources} />
                        })()
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ... Reusing components from MeetingPrepPage by duplicating them here to be self-contained ...
// Note: In a real refactor, these would be extracted to shared components.
// For now, duplicating as requested to ensure "All features" are present and isolated.

function SortableMeetingItem({ id, children, viewMode }: { id: string, children: React.ReactNode, viewMode: 'list' | 'grid' }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
        touchAction: 'none'
    };

    if (viewMode === 'grid') {
        return (
            <div ref={setNodeRef} style={style} className="group relative">
                <button
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 z-20 p-1.5 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                {children}
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="flex gap-3 items-start group">
            <button
                {...attributes}
                {...listeners}
                className="mt-6 p-2 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-colors"
                title="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

function CompactMeetingCard({ meeting, onClick, isReadOnly = false }: { meeting: IntentBlock, onClick: () => void, isReadOnly?: boolean }) {
    const readinessLevel = (meeting.questions?.length || 0) >= 3 ? 'Ready' : (meeting.questions?.length || 0) > 0 ? 'Partial' : 'Not Prepared'

    return (
        <Card
            className={cn(
                "h-full cursor-pointer hover:shadow-md transition-all border-l-4",
                readinessLevel === 'Ready' ? "border-l-green-500" :
                    readinessLevel === 'Partial' ? "border-l-yellow-500" : "border-l-red-500"
            )}
            onClick={onClick}
        >
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                        {format(new Date(meeting.date), "MMM d")}
                    </Badge>
                    {meeting.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>

                <div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{meeting.objective}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{meeting.outputDefinition}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {meeting.questions?.length || 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        {meeting.resources?.length || 0}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function MeetingPrepCard({ meeting, isReadOnly = false, upcomingMeetings = [] }: { meeting: IntentBlock, isReadOnly?: boolean, upcomingMeetings?: IntentBlock[] }) {
    const { updateIntent, deleteIntent, addIntent } = useCalendarStore()

    const [newQuestion, setNewQuestion] = useState("")
    const [isMustAsk, setIsMustAsk] = useState(false)

    // Resource State
    const [isAddingResource, setIsAddingResource] = useState(false)
    const [resType, setResType] = useState<ResourceType>('link')
    const [resUrl, setResUrl] = useState("")
    const [resTitle, setResTitle] = useState("")
    const [resDesc, setResDesc] = useState("")

    // Question Attachment State
    const [isAttachingToQuestion, setIsAttachingToQuestion] = useState(false)
    const [qResType, setQResType] = useState<ResourceType>('link')
    const [qResUrl, setQResUrl] = useState("")
    const [qResTitle, setQResTitle] = useState("")
    const [qPendingAttachments, setQPendingAttachments] = useState<MeetingResource[]>([])

    // Tag State
    const [qTags, setQTags] = useState<string[]>([])
    const [qNewTag, setQNewTag] = useState("")
    const [isAddingQTag, setIsAddingQTag] = useState(false)

    // Move/Convert Note State
    const [moveNoteId, setMoveNoteId] = useState<string | null>(null)
    const [convertNoteId, setConvertNoteId] = useState<string | null>(null)
    const [targetMeetingId, setTargetMeetingId] = useState<string>("")

    const questions = meeting.questions || []
    const resources = meeting.resources || []

    const questionCount = questions.length
    const isReady = questionCount >= 3
    const readinessLevel = isReady ? 'Ready' : questionCount > 0 ? 'Partial' : 'Not Prepared'

    const handleAddQuestion = (e?: React.FormEvent) => {
        e?.preventDefault()
        const stripped = newQuestion.replace(/<[^>]*>/g, '').trim()
        if (!stripped && !newQuestion.includes('<img')) return

        let attachments: MeetingResource[] | undefined = undefined;

        if (qPendingAttachments.length > 0) {
            attachments = [...qPendingAttachments];
        } else if (isAttachingToQuestion && (qResUrl || qResTitle)) {
            const resource: MeetingResource = {
                id: crypto.randomUUID(),
                type: qResType,
                title: qResTitle || (qResType === 'link' ? 'Link' : 'Attachment'),
                url: qResUrl,
                createdAt: Date.now()
            }
            attachments = [resource];
        }

        const question: MeetingQuestion = {
            id: crypto.randomUUID(),
            text: newQuestion.trim(),
            isMustAsk,
            isAnswered: false,
            tags: qTags,
            attachments
        }

        updateIntent(meeting.id, {
            questions: [...questions, question]
        })

        setNewQuestion("")
        setIsMustAsk(false)
        setIsAttachingToQuestion(false)
        setQResType('link')
        setQResUrl("")
        setQResTitle("")
        setQPendingAttachments([])
        setQTags([])
        setIsAddingQTag(false)
    }

    const toggleQuestionAnswered = (qId: string) => {
        const updated = questions.map(q =>
            q.id === qId ? { ...q, isAnswered: !q.isAnswered } : q
        )
        updateIntent(meeting.id, { questions: updated })
    }

    const deleteQuestion = (qId: string) => {
        const questionToDelete = questions.find(q => q.id === qId);
        if (!questionToDelete) return;
        const updated = questions.filter(q => q.id !== qId);
        updateIntent(meeting.id, { questions: updated });
        toast("Question deleted", {
            action: {
                label: "Undo",
                onClick: () => {
                    updateIntent(meeting.id, { questions: [...updated, questionToDelete] })
                }
            }
        })
    }

    const toggleMustAsk = (qId: string) => {
        const updated = questions.map(q =>
            q.id === qId ? { ...q, isMustAsk: !q.isMustAsk } : q
        )
        updateIntent(meeting.id, { questions: updated })
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDragEndQuestions = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = questions.findIndex((item) => item.id === active.id);
            const newIndex = questions.findIndex((item) => item.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newQuestions = arrayMove(questions, oldIndex, newIndex);
                updateIntent(meeting.id, { questions: newQuestions });
            }
        }
    };

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

        updateIntent(meeting.id, {
            resources: [...resources, newResource]
        })

        setResTitle("")
        setResUrl("")
        setResDesc("")
        setIsAddingResource(false)
    }

    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [editQuestionText, setEditQuestionText] = useState("")

    const startEditingQuestion = (q: MeetingQuestion) => {
        setEditingQuestionId(q.id)
        setEditQuestionText(q.text)
    }

    const saveQuestionEdit = (qId: string) => {
        if (!editQuestionText.trim()) return
        const updated = questions.map(q =>
            q.id === qId ? { ...q, text: editQuestionText } : q
        )
        updateIntent(meeting.id, { questions: updated })
        setEditingQuestionId(null)
        setEditQuestionText("")
    }

    const cancelQuestionEdit = () => {
        setEditingQuestionId(null)
        setEditQuestionText("")
    }

    const deleteResource = (rId: string) => {
        const resourceToDelete = resources.find(r => r.id === rId);
        if (!resourceToDelete) return;
        const updated = resources.filter(r => r.id !== rId);
        updateIntent(meeting.id, { resources: updated });
        toast("Resource deleted", {
            action: {
                label: "Undo",
                onClick: () => {
                    updateIntent(meeting.id, { resources: [...updated, resourceToDelete] })
                }
            }
        })
    }

    const [newNote, setNewNote] = useState("")
    const [isNoteImportant, setIsNoteImportant] = useState(false)
    const [isAttachingToNote, setIsAttachingToNote] = useState(false)
    const [nResType, setNResType] = useState<ResourceType>('link')
    const [nResUrl, setNResUrl] = useState("")
    const [nResTitle, setNResTitle] = useState("")
    const [nPendingAttachments, setNPendingAttachments] = useState<MeetingResource[]>([])

    const [nTags, setNTags] = useState<string[]>([])
    const [nNewTag, setNNewTag] = useState("")
    const [isAddingNTag, setIsAddingNTag] = useState(false)

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editNoteText, setEditNoteText] = useState("")


    const meetingNotes = meeting.meetingNotes || []

    const handleAddNote = (e?: React.FormEvent) => {
        e?.preventDefault()
        const stripped = newNote.replace(/<[^>]*>/g, '').trim()
        if (!stripped && !newNote.includes('<img')) return

        let attachments: MeetingResource[] | undefined = undefined;

        if (nPendingAttachments.length > 0) {
            attachments = [...nPendingAttachments];
        } else if (isAttachingToNote && (nResUrl || nResTitle)) {
            const resource: MeetingResource = {
                id: crypto.randomUUID(),
                type: nResType,
                title: nResTitle || (nResType === 'link' ? 'Link' : 'Attachment'),
                url: nResUrl,
                createdAt: Date.now()
            }
            attachments = [resource];
        }

        const note: MeetingNoteItem = {
            id: crypto.randomUUID(),
            text: newNote.trim(),
            isImportant: isNoteImportant,
            isCompleted: false,
            tags: nTags,
            attachments
        }

        updateIntent(meeting.id, {
            meetingNotes: [...meetingNotes, note]
        })

        setNewNote("")
        setIsNoteImportant(false)
        setIsAttachingToNote(false)
        setNResType('link')
        setNResUrl("")
        setNResTitle("")
        setNPendingAttachments([])
        setNTags([])
        setIsAddingNTag(false)
    }

    const toggleNoteCompleted = (nId: string) => {
        const updated = meetingNotes.map(n =>
            n.id === nId ? { ...n, isCompleted: !n.isCompleted } : n
        )
        updateIntent(meeting.id, { meetingNotes: updated })
    }


    const toggleNoteImportant = (nId: string) => {
        const updated = meetingNotes.map(n =>
            n.id === nId ? { ...n, isImportant: !n.isImportant } : n
        )
        updateIntent(meeting.id, { meetingNotes: updated })
    }

    const deleteNote = (nId: string) => {
        const noteToDelete = meetingNotes.find(n => n.id === nId);
        if (!noteToDelete) return;
        const updated = meetingNotes.filter(n => n.id !== nId);
        updateIntent(meeting.id, { meetingNotes: updated });
        toast("Note deleted", {
            action: {
                label: "Undo",
                onClick: () => {
                    updateIntent(meeting.id, { meetingNotes: [...updated, noteToDelete] })
                }
            }
        })
    }

    const confirmMoveNote = () => {
        if (!moveNoteId || !targetMeetingId) return
        const noteToMove = meetingNotes.find(n => n.id === moveNoteId)
        if (!noteToMove) return
        const targetMeeting = upcomingMeetings.find(m => m.id === targetMeetingId)
        if (!targetMeeting) return

        const updatedCurrent = meetingNotes.filter(n => n.id !== moveNoteId)
        updateIntent(meeting.id, { meetingNotes: updatedCurrent })
        const targetNotes = targetMeeting.meetingNotes || []
        updateIntent(targetMeeting.id, { meetingNotes: [...targetNotes, noteToMove] })

        setMoveNoteId(null)
        setTargetMeetingId("")
        toast.success(`Note moved to "${targetMeeting.objective}"`)
    }

    const onDragEndNotes = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = meetingNotes.findIndex((item) => item.id === active.id);
            const newIndex = meetingNotes.findIndex((item) => item.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newNotes = arrayMove(meetingNotes, oldIndex, newIndex);
                updateIntent(meeting.id, { meetingNotes: newNotes });
            }
        }
    };

    const startEditingNote = (note: MeetingNoteItem) => {
        setEditingNoteId(note.id)
        setEditNoteText(note.text)
    }

    const saveNoteEdit = (nId: string) => {
        if (!editNoteText.trim()) return
        const updated = meetingNotes.map(n =>
            n.id === nId ? { ...n, text: editNoteText } : n
        )
        updateIntent(meeting.id, { meetingNotes: updated })
        setEditingNoteId(null)
        setEditNoteText("")
    }

    const cancelNoteEdit = () => {
        setEditingNoteId(null)
        setEditNoteText("")
    }

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isToday(date)) return "Today"
        if (isTomorrow(date)) return "Tomorrow"
        return format(date, "EEEE, MMM d")
    }

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case 'link': return <LinkIcon className="h-4 w-4" />
            case 'file': return <FileText className="h-4 w-4" />
            case 'image': return <ImageIcon className="h-4 w-4" />
            default: return <LinkIcon className="h-4 w-4" />
        }
    }

    const [editingMeeting, setEditingMeeting] = useState<IntentBlock | null>(null)

    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
    };
    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const newResources: MeetingResource[] = [];
            const initialResources = meeting.resources || [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isImage = file.type.startsWith('image/');
                let url: string | null = "";

                try {
                    toast.loading(`Uploading ${file.name}...`);
                    url = await storage.uploadFile(file, 'meeting-assets');

                    if (!url) {
                        toast.dismiss();
                        toast.error(`Failed to upload ${file.name}`);
                        continue;
                    }
                    toast.dismiss();
                    toast.success(`Uploaded ${file.name}`);

                } catch (e) {
                    console.error(e);
                    toast.dismiss();
                    toast.error("Upload failed");
                    continue;
                }

                const newResource: MeetingResource = {
                    id: crypto.randomUUID(),
                    type: isImage ? 'image' : 'file',
                    title: file.name,
                    url: url,
                    createdAt: Date.now()
                };

                newResources.push(newResource);

                // Optional: Update optimistically per file if desired, ensuring we always tack onto the *original* list + *all new so far*
                // But doing it once at the end as requested by the prompt for safety/simplicity
            }

            if (newResources.length > 0) {
                updateIntent(meeting.id, { resources: [...initialResources, ...newResources] });
            }
        }
    };

    const handleConvertSuccess = () => {
        setConvertNoteId(null)
        toast.success("Note converted to task")
    }

    return (
        <>
            <Card
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn("border-l-4 transition-all hover:shadow-md relative",
                    readinessLevel === 'Ready' ? "border-l-green-500" :
                        readinessLevel === 'Partial' ? "border-l-yellow-500" : "border-l-red-500",
                    isDraggingFile && "ring-2 ring-primary ring-offset-2 bg-muted/50"
                )}>
                {isDraggingFile && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                            <Paperclip className="h-12 w-12 mx-auto text-primary mb-2 animate-bounce" />
                            <h3 className="text-xl font-bold text-primary">Drop files to attach</h3>
                        </div>
                    </div>
                )}
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
                                <Layers className="h-4 w-4" />
                                <span>{getDateLabel(meeting.date)}</span>
                                {meeting.scheduledTime && (
                                    <>
                                        <span>•</span>
                                        <span>@{meeting.scheduledTime}</span>
                                    </>
                                )}
                            </div>
                            <CardTitle className="text-2xl">{meeting.objective}</CardTitle>
                            {meeting.outputDefinition && (
                                <CardDescription className="line-clamp-1">
                                    Goal: {meeting.outputDefinition}
                                </CardDescription>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={cn(
                                "px-3 py-1 text-sm font-medium border-2",
                                readinessLevel === 'Ready'
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                    : readinessLevel === 'Partial'
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            )}>
                                {readinessLevel === 'Ready' && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                                {readinessLevel === 'Partial' && <Brain className="mr-1.5 h-4 w-4" />}
                                {readinessLevel === 'Not Prepared' && <AlertCircle className="mr-1.5 h-4 w-4" />}
                                {readinessLevel}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingMeeting(meeting)}>
                                        <PenTool className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    {meeting.status !== 'completed' && (
                                        <DropdownMenuItem
                                            onClick={() => updateIntent(meeting.id, { status: 'completed' })}
                                            className="text-green-600 focus:text-green-700 font-medium"
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Mark as Done
                                        </DropdownMenuItem>
                                    )}
                                    {meeting.status === 'completed' && (
                                        <DropdownMenuItem
                                            onClick={() => updateIntent(meeting.id, { status: 'planned' })}
                                        >
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            Reactivate
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => deleteIntent(meeting.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="questions" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="questions" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Questions ({questions.length})
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="gap-2">
                                <Paperclip className="h-4 w-4" />
                                Resources ({resources.length})
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="gap-2">
                                <ListTodo className="h-4 w-4" />
                                Notes / Next Steps ({meetingNotes.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Not duplicating the inner content of tabs to save space, assuming usage of shared components or identical structure */}
                        <TabsContent value="questions" className="space-y-6">
                            {/* ... Question Form & List ... */}
                            <div className="space-y-3">
                                <form onSubmit={handleAddQuestion} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <RichTextEditor
                                            placeholder="Add a question or inquiry..."
                                            className="min-h-[80px]"
                                            value={newQuestion}
                                            onChange={setNewQuestion}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className={cn(isAttachingToQuestion && "bg-blue-50 text-blue-600 border-blue-200")}
                                        onClick={() => setIsAttachingToQuestion(!isAttachingToQuestion)}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Button type="submit">Add</Button>
                                </form>

                                {/* Tag Input Area */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    {qTags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => setQTags(qTags.filter(t => t !== tag))}
                                                className="hover:text-destructive"
                                            >
                                                &times;
                                            </button>
                                        </Badge>
                                    ))}

                                    {isAddingQTag ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                autoFocus
                                                className="h-6 w-24 text-xs px-1"
                                                placeholder="Tag..."
                                                value={qNewTag}
                                                onChange={e => setQNewTag(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (qNewTag.trim() && !qTags.includes(qNewTag.trim())) {
                                                            setQTags([...qTags, qNewTag.trim()]);
                                                            setQNewTag("");
                                                        }
                                                    } else if (e.key === 'Escape') {
                                                        setIsAddingQTag(false);
                                                        setQNewTag("");
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (qNewTag.trim() && !qTags.includes(qNewTag.trim())) {
                                                        setQTags([...qTags, qNewTag.trim()]);
                                                    }
                                                    setIsAddingQTag(false);
                                                    setQNewTag("");
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-muted-foreground"
                                            onClick={() => setIsAddingQTag(true)}
                                        >
                                            <Tag className="h-3 w-3 mr-1" />
                                            Add Tag
                                        </Button>
                                    )}
                                </div>

                                {/* Attachments Area */}
                                {isAttachingToQuestion && (
                                    <div className="p-3 bg-muted/40 rounded-lg border text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex gap-2 items-center">
                                            <div className="w-[100px]">
                                                <Select
                                                    value={qResType}
                                                    onValueChange={(val) => setQResType(val as ResourceType)}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="link">Link</SelectItem>
                                                        <SelectItem value="file">File</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {qResType === 'link' ? (
                                                <div key="link-mode" className="flex-1 flex gap-2">
                                                    <Input
                                                        placeholder="https://"
                                                        className="h-8 flex-1"
                                                        value={qResUrl}
                                                        onChange={e => setQResUrl(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (qResUrl.trim()) {
                                                                    const resource: MeetingResource = {
                                                                        id: crypto.randomUUID(),
                                                                        type: 'link',
                                                                        title: qResTitle || 'Link',
                                                                        url: qResUrl,
                                                                        createdAt: Date.now()
                                                                    }
                                                                    setQPendingAttachments([...qPendingAttachments, resource])
                                                                    setQResUrl("")
                                                                    setQResTitle("")
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button size="sm" type="button" variant="secondary" onClick={() => {
                                                        if (qResUrl.trim()) {
                                                            const resource: MeetingResource = {
                                                                id: crypto.randomUUID(),
                                                                type: 'link',
                                                                title: qResTitle || 'Link',
                                                                url: qResUrl,
                                                                createdAt: Date.now()
                                                            }
                                                            setQPendingAttachments([...qPendingAttachments, resource])
                                                            setQResUrl("")
                                                            setQResTitle("")
                                                        }
                                                    }}>Add Link</Button>
                                                </div>
                                            ) : (
                                                <div key="file-mode" className="flex-1">
                                                    <Input
                                                        type="file"
                                                        multiple
                                                        className="h-8 text-xs cursor-pointer"
                                                        onChange={async (e) => {
                                                            const files = e.target.files
                                                            if (files && files.length > 0) {
                                                                const newAttachments: MeetingResource[] = []
                                                                for (let i = 0; i < files.length; i++) {
                                                                    const file = files[i]
                                                                    const isImage = file.type.startsWith('image/');
                                                                    let url = "";

                                                                    try {
                                                                        if (isImage) {
                                                                            const blob = await compressImageToBlob(file);
                                                                            url = await uploadFileToStorage(blob, file.name);
                                                                        } else {
                                                                            url = await uploadFileToStorage(file);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Upload failed:', err);
                                                                        alert(`Failed to upload ${file.name}`);
                                                                        continue;
                                                                    }

                                                                    const resource: MeetingResource = {
                                                                        id: crypto.randomUUID(),
                                                                        type: isImage ? 'image' : 'file',
                                                                        title: file.name,
                                                                        url: url,
                                                                        createdAt: Date.now()
                                                                    }
                                                                    newAttachments.push(resource)
                                                                }
                                                                setQPendingAttachments([...qPendingAttachments, ...newAttachments])
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {qResType === 'link' && (
                                            <Input
                                                placeholder="Link Title (Optional)"
                                                className="h-8"
                                                value={qResTitle}
                                                onChange={e => setQResTitle(e.target.value)}
                                            />
                                        )}

                                        {/* Pending Attachments List */}
                                        {qPendingAttachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {qPendingAttachments.map(att => (
                                                    <div key={att.id} className="flex items-center gap-1 bg-background border px-2 py-1 rounded-md text-xs">
                                                        {att.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                                                        <span className="max-w-[150px] truncate">{att.title}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQPendingAttachments(qPendingAttachments.filter(x => x.id !== att.id))}
                                                            className="text-muted-foreground hover:text-destructive ml-1"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {questions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground/80 italic text-base bg-muted/30 rounded-lg">
                                            No questions added.
                                        </div>
                                    ) : (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={onDragEndQuestions}
                                        >
                                            <SortableContext
                                                items={questions.map(q => q.id)}
                                                strategy={rectSortingStrategy}
                                            >
                                                <div className="flex flex-col gap-4">
                                                    {questions.map((q, index) => (
                                                        <SortableQuestionItem
                                                            key={q.id}
                                                            id={q.id}
                                                            q={q}
                                                            index={index}
                                                            meetingId={meeting.id}
                                                            updateIntent={updateIntent}
                                                            deleteQuestion={deleteQuestion}
                                                            toggleMustAsk={toggleMustAsk}
                                                            toggleQuestionAnswered={toggleQuestionAnswered}
                                                            startEditingQuestion={startEditingQuestion}
                                                            editingQuestionId={editingQuestionId}
                                                            editQuestionText={editQuestionText}
                                                            setEditQuestionText={setEditQuestionText}
                                                            cancelQuestionEdit={cancelQuestionEdit}
                                                            saveQuestionEdit={saveQuestionEdit}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="resources" className="space-y-4">
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
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            const isImage = file.type.startsWith('image/');
                                                            setResTitle(file.name);

                                                            try {
                                                                let url: string;
                                                                if (isImage) {
                                                                    const blob = await compressImageToBlob(file);
                                                                    url = await uploadFileToStorage(blob, file.name);
                                                                } else {
                                                                    url = await uploadFileToStorage(file);
                                                                }
                                                                setResUrl(url);
                                                            } catch (err) {
                                                                console.error('Upload failed:', err);
                                                                alert("Failed to upload file.");
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                *Local file reference only. File content saved to browser storage.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label>Description (Optional)</Label>
                                        <Textarea
                                            placeholder="Brief context..."
                                            className="h-20"
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
                                {resources.map(res => (
                                    <div key={res.id} className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                                        <div className="mt-1 p-2 rounded-md bg-muted text-muted-foreground">
                                            {getResourceIcon(res.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const url = res.url || "";
                                                    if (url.startsWith('data:')) {
                                                        // Convert Base64 to Blob to open safely in new tab
                                                        fetch(url)
                                                            .then(res => res.blob())
                                                            .then(blob => {
                                                                const objUrl = URL.createObjectURL(blob);
                                                                const newWin = window.open(objUrl, '_blank');
                                                                if (newWin) {
                                                                    newWin.onload = () => URL.revokeObjectURL(objUrl);
                                                                    // Fallback cleanup if onload doesn't fire (e.g. cross-origin restriction) or just to be safe after some time
                                                                    setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
                                                                } else {
                                                                    URL.revokeObjectURL(objUrl);
                                                                    alert("Please allow popups to view this file.");
                                                                }
                                                            });
                                                    } else {
                                                        window.open(url, '_blank', 'noopener,noreferrer');
                                                    }
                                                }}
                                                className="font-medium hover:underline flex items-center gap-1 text-left"
                                            >
                                                {res.title}
                                            </button>
                                            {res.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {res.description}
                                                </p>
                                            )}
                                            {res.url && (
                                                <p className="text-xs text-muted-foreground/50 truncate max-w-[300px]">
                                                    {res.url.startsWith('data:') ? 'Stored File' : res.url}
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
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-6">
                            {/* Add Note Input */}
                            <div className="space-y-3">
                                <form onSubmit={handleAddNote} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <RichTextEditor
                                            placeholder="Add a note, decision, or next step..."
                                            className="min-h-[80px]"
                                            value={newNote}
                                            onChange={setNewNote}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className={cn(isAttachingToNote && "bg-blue-50 text-blue-600 border-blue-200")}
                                        onClick={() => setIsAttachingToNote(!isAttachingToNote)}
                                        title="Attach Link or File"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className={cn(isNoteImportant && "text-yellow-500 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20")}
                                        onClick={() => setIsNoteImportant(!isNoteImportant)}
                                        title="Mark as Important / Action Item"
                                    >
                                        <Star className={cn("h-4 w-4", isNoteImportant && "fill-current")} />
                                    </Button>
                                    <Button type="submit">Add</Button>
                                </form>

                                {/* Note Tag Input Area */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    {nTags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => setNTags(nTags.filter(t => t !== tag))}
                                                className="hover:text-destructive"
                                            >
                                                &times;
                                            </button>
                                        </Badge>
                                    ))}

                                    {isAddingNTag ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                autoFocus
                                                className="h-6 w-24 text-xs px-1"
                                                placeholder="Tag..."
                                                value={nNewTag}
                                                onChange={e => setNNewTag(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (nNewTag.trim() && !nTags.includes(nNewTag.trim())) {
                                                            setNTags([...nTags, nNewTag.trim()]);
                                                            setNNewTag("");
                                                        }
                                                    } else if (e.key === 'Escape') {
                                                        setIsAddingNTag(false);
                                                        setNNewTag("");
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (nNewTag.trim() && !nTags.includes(nNewTag.trim())) {
                                                        setNTags([...nTags, nNewTag.trim()]);
                                                    }
                                                    setIsAddingNTag(false);
                                                    setNNewTag("");
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-muted-foreground"
                                            onClick={() => setIsAddingNTag(true)}
                                        >
                                            <Tag className="h-3 w-3 mr-1" />
                                            Add Tag
                                        </Button>
                                    )}
                                </div>

                            </div>
                            {/* Attachment Form for Note */}
                            {isAttachingToNote && (
                                <div className="p-3 bg-muted/40 rounded-lg border text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-[100px]">
                                            <Select
                                                value={nResType}
                                                onValueChange={(val) => setNResType(val as ResourceType)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="link">Link</SelectItem>
                                                    <SelectItem value="file">File</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {nResType === 'link' ? (
                                            <Input
                                                key="n-link-input"
                                                placeholder="https://"
                                                className="h-8 flex-1"
                                                value={nResUrl}
                                                onChange={e => setNResUrl(e.target.value)}
                                            />
                                        ) : (
                                            <div key="n-file-input" className="flex-1">
                                                <Input
                                                    type="file"
                                                    className="h-8 text-xs cursor-pointer"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            const isImage = file.type.startsWith('image/');
                                                            setNResTitle(file.name);

                                                            try {
                                                                let url: string;
                                                                if (isImage) {
                                                                    const blob = await compressImageToBlob(file);
                                                                    url = await uploadFileToStorage(blob, file.name);
                                                                } else {
                                                                    url = await uploadFileToStorage(file);
                                                                }
                                                                setNResUrl(url);
                                                            } catch (err) {
                                                                console.error('Upload failed:', err);
                                                                alert("Failed to upload file.");
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Input
                                        placeholder={nResType === 'link' ? "Link Title (Optional)" : "File attached (Auto-filled)"}
                                        className="h-8"
                                        value={nResTitle}
                                        onChange={e => setNResTitle(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Notes List */}
                            <div className="space-y-4">
                                {meetingNotes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground/80 italic text-base bg-muted/30 rounded-lg">
                                        No notes recorded yet.
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={onDragEndNotes}
                                    >
                                        <SortableContext
                                            items={meetingNotes.map(n => n.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="flex flex-col gap-2">
                                                {meetingNotes.map((note) => (
                                                    <SortableNoteItem
                                                        key={note.id}
                                                        id={note.id}
                                                        note={note}
                                                        layoutId={note.id}
                                                        toggleNoteCompleted={toggleNoteCompleted}
                                                        startEditingNote={startEditingNote}
                                                        deleteNote={deleteNote}
                                                        toggleNoteImportant={toggleNoteImportant}
                                                        editingNoteId={editingNoteId}
                                                        editNoteText={editNoteText}
                                                        setEditNoteText={setEditNoteText}
                                                        cancelNoteEdit={cancelNoteEdit}
                                                        saveNoteEdit={saveNoteEdit}
                                                        onMove={() => setMoveNoteId(note.id)}
                                                        onConvert={() => setConvertNoteId(note.id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {editingMeeting && (
                <AddIntentDialog
                    open={true}
                    onOpenChange={(open) => !open && setEditingMeeting(null)}
                    date={new Date(editingMeeting.date)}
                    intent={editingMeeting || undefined}
                    isTaskResource={true}
                />
            )}

            {/* Move Note Dialog */}
            <Dialog open={!!moveNoteId} onOpenChange={(open) => !open && setMoveNoteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move Note to Another Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label>Select Target Meeting</Label>
                            <Select value={targetMeetingId} onValueChange={setTargetMeetingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a meeting..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {upcomingMeetings.filter(m => m.id !== meeting.id).map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            <span className="font-medium">{m.date} {m.scheduledTime}</span> - {m.objective}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setMoveNoteId(null)}>Cancel</Button>
                        <Button onClick={confirmMoveNote} disabled={!targetMeetingId}>Move Note</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Convert to Task Dialog */}
            {convertNoteId && (
                <AddIntentDialog
                    open={!!convertNoteId}
                    onOpenChange={(open) => !open && setConvertNoteId(null)}
                    date={new Date()} // Default to today
                    intent={{
                        id: crypto.randomUUID(),
                        objective: meetingNotes.find(n => n.id === convertNoteId)?.text || "",
                        outputDefinition: "",
                        estimatedEffort: "medium",
                        type: "work",
                        status: "planned", // Default
                        microSteps: [],
                        createdAt: Date.now(),
                        date: format(new Date(), 'yyyy-MM-dd'),
                        isMeeting: false,
                    } as IntentBlock}
                    onSuccess={handleConvertSuccess}
                />
            )}
        </>
    )
}
// --- Sub-Components ---
// Extracted to bottom to update MeetingPrepPage cleanly
function SortableQuestionItem({
    id,
    q,
    index,
    meetingId,
    updateIntent,
    deleteQuestion,
    toggleMustAsk,
    toggleQuestionAnswered,
    startEditingQuestion,
    editingQuestionId,
    editQuestionText,
    setEditQuestionText,
    cancelQuestionEdit,
    saveQuestionEdit
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex items-start gap-4 p-4 rounded-lg bg-card hover:bg-muted/40 transition-colors border border-transparent hover:border-muted relative">
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/0 group-hover:text-muted-foreground/30 hover:!text-foreground transition-all"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {editingQuestionId === q.id ? (
                <div className="flex flex-col gap-2 flex-1 w-full pl-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-6 text-center">{index + 1}.</span>
                        <span className="text-xs text-muted-foreground uppercase">Editing</span>
                    </div>
                    <RichTextEditor
                        value={editQuestionText || ""}
                        onChange={setEditQuestionText}
                        className="min-h-[80px]"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelQuestionEdit}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveQuestionEdit(q.id)}>
                            Save
                        </Button>
                    </div>

                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mt-1 pl-6">
                        <span className="text-base font-semibold text-slate-500 w-6 text-right">{index + 1}.</span>
                        <Checkbox
                            checked={q.isAnswered}
                            onCheckedChange={() => toggleQuestionAnswered(q.id)}
                        />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                        <div
                            className={cn(
                                "text-base leading-relaxed prose prose-base dark:prose-invert max-w-none [&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4",
                                q.isAnswered && "opacity-60 line-through decoration-slate-400"
                            )}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.text) }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            {q.isMustAsk && (
                                <Badge variant="secondary" className="h-5 px-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] gap-1">
                                    <Star className="h-3 w-3 fill-current" /> Must Ask
                                </Badge>
                            )}
                            {q.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px] gap-1">
                                    <Tag className="h-3 w-3" /> {tag}
                                </Badge>
                            ))}
                            {q.attachments?.map((att: MeetingResource) => (
                                <button
                                    key={att.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const url = att.url || "";
                                        if (url.startsWith('data:')) {
                                            fetch(url)
                                                .then(res => res.blob())
                                                .then(blob => {
                                                    const objUrl = URL.createObjectURL(blob);
                                                    const newWin = window.open(objUrl, '_blank');
                                                    if (newWin) {
                                                        newWin.onload = () => URL.revokeObjectURL(objUrl);
                                                        // Fallback cleanup
                                                        setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
                                                    } else {
                                                        URL.revokeObjectURL(objUrl);
                                                        alert("Please allow popups to view this file.");
                                                    }
                                                });
                                        } else {
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100 hover:underline cursor-pointer"
                                >
                                    {att.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                                    {att.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-1 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => startEditingQuestion(q)}
                            title="Edit Question"
                        >
                            <PenTool className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-yellow-600"
                            onClick={() => toggleMustAsk(q.id)}
                        >
                            <Star className={cn("h-4 w-4", q.isMustAsk && "fill-current")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteQuestion(q.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

function SortableNoteItem({
    id,
    note,
    layoutId,
    toggleNoteCompleted,
    // moveNote, // Removed
    startEditingNote,
    deleteNote,
    toggleNoteImportant,
    editingNoteId,
    editNoteText,
    setEditNoteText,
    cancelNoteEdit,
    saveNoteEdit,
    onMove,
    onConvert
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex items-start gap-4 p-3 rounded-lg bg-card hover:bg-muted/40 transition-colors border border-transparent hover:border-muted relative">
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-3 p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/0 group-hover:text-muted-foreground/30 hover:!text-foreground transition-all"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {editingNoteId === note.id ? (
                <div className="flex flex-col gap-2 flex-1 pl-6">
                    <RichTextEditor
                        value={editNoteText || ""}
                        onChange={setEditNoteText}
                        className="min-h-[80px]"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelNoteEdit}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveNoteEdit(note.id)}>
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Checkbox
                        className="mt-1 ml-6"
                        checked={note.isCompleted}
                        onCheckedChange={() => toggleNoteCompleted(note.id)}
                        id={`note-${note.id}`}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                        <div
                            className={cn(
                                "text-base leading-relaxed prose prose-base dark:prose-invert max-w-none [&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4",
                                note.isCompleted && "opacity-60 line-through decoration-slate-400"
                            )}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.text) }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            {note.isImportant && (
                                <Badge variant="secondary" className="h-5 px-1.5 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 text-[10px] gap-1">
                                    <AlertCircle className="h-3 w-3" /> Important
                                </Badge>
                            )}
                            {note.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px] gap-1">
                                    <Tag className="h-3 w-3" /> {tag}
                                </Badge>
                            ))}
                            {note.attachments?.map((att: MeetingResource) => (
                                <button
                                    key={att.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const url = att.url || "";
                                        if (url.startsWith('data:')) {
                                            fetch(url)
                                                .then(res => res.blob())
                                                .then(blob => {
                                                    const objUrl = URL.createObjectURL(blob);
                                                    const newWin = window.open(objUrl, '_blank');
                                                    if (newWin) {
                                                        newWin.onload = () => URL.revokeObjectURL(objUrl);
                                                        // Fallback cleanup
                                                        setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
                                                    } else {
                                                        URL.revokeObjectURL(objUrl);
                                                        alert("Please allow popups to view this file.");
                                                    }
                                                });
                                        } else {
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100 hover:underline cursor-pointer"
                                >
                                    {att.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                                    {att.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    title="Move / Convert"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onMove}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Move to Next Meeting
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onConvert}>
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    Convert to Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => startEditingNote(note)}
                        >
                            <PenTool className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
