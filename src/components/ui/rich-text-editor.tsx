"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Toggle } from "@/components/ui/toggle"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
    Unlink
} from "lucide-react"
import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
    value?: string
    onChange: (html: string) => void
    placeholder?: string
    className?: string
    autoFocus?: boolean
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b p-1 bg-muted/20">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <Bold className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <Italic className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('underline')}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <UnderlineIcon className="h-3.5 w-3.5" />
            </Toggle>
            <div className="w-px h-4 bg-border mx-1" />
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <List className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <ListOrdered className="h-3.5 w-3.5" />
            </Toggle>
            <div className="w-px h-4 bg-border mx-1" />
            <Toggle
                size="sm"
                pressed={editor.isActive('link')}
                onPressedChange={setLink}
                aria-label="Toggle Link"
                className="h-7 w-7 data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
                <LinkIcon className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
                size="sm"
                disabled={!editor.isActive('link')}
                onPressedChange={() => editor.chain().focus().unsetLink().run()}
                aria-label="Unknown Link"
                className="h-7 w-7"
            >
                <Unlink className="h-3.5 w-3.5" />
            </Toggle>
        </div>
    )
}

export function RichTextEditor({ value, onChange, placeholder, className, autoFocus }: RichTextEditorProps) {
    // Force re-render on editor updates to ensure MenuBar state is fresh
    const [, forceUpdate] = useState(0)

    const editor = useEditor({
        immediatelyRender: false,
        onTransaction: () => {
            forceUpdate((n) => n + 1)
        },
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-base dark:prose-invert max-w-none min-h-[80px] w-full rounded-md border-0 bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        autofocus: autoFocus
    })

    // Update content if value changes externally (e.g. reset form)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Only update if the content is drastically different to avoid cursor jumps
            // For simple "reset to empty" check:
            if (value === '' || value === '<p></p>') {
                editor.commands.clearContent()
            } else if (value && !editor.isFocused) {
                // only set content if not focused to avoid typing interruption
                // unless it's initial load. 
                // Tiptap handles initial content well, this useEffect is mostly for resets.
                editor.commands.setContent(value)
            }
        }
    }, [value, editor])

    return (
        <div className={cn("flex flex-col border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1" />
        </div>
    )
}
