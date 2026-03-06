'use client'

import { useState } from 'react'
import { useCalendarStore } from '@/lib/store/calendar-store'
import { uploadFileToStorage } from '@/lib/supabase-upload'
import { Button } from '@/components/ui/button'
import { MeetingResource } from '@/types'

/**
 * One-time migration utility: finds all base64 data URLs in the calendar store
 * (intents.resources, intents.questions[].attachments, intents.meetingNotes[].attachments)
 * and re-uploads them to Supabase Storage, replacing the URLs in-place.
 */
export function DataMigration() {
    const { intents, updateIntent } = useCalendarStore()
    const [migrating, setMigrating] = useState(false)
    const [log, setLog] = useState<string[]>([])
    const [stats, setStats] = useState({ found: 0, migrated: 0, failed: 0, skipped: 0 })

    const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

    const isBase64Url = (url?: string) => url?.startsWith('data:')

    const base64ToBlob = (dataUrl: string): Blob => {
        const parts = dataUrl.split(',')
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
        const bstr = atob(parts[1])
        const u8arr = new Uint8Array(bstr.length)
        for (let i = 0; i < bstr.length; i++) {
            u8arr[i] = bstr.charCodeAt(i)
        }
        return new Blob([u8arr], { type: mime })
    }

    const migrateResource = async (resource: MeetingResource): Promise<string | null> => {
        if (!isBase64Url(resource.url)) return null

        try {
            const blob = base64ToBlob(resource.url!)
            const ext = resource.type === 'image' ? 'jpg' : (resource.title?.split('.').pop() || 'bin')
            const fileName = `migrated-${resource.id}.${ext}`
            const publicUrl = await uploadFileToStorage(blob, fileName)

            // Check that we got a real URL back (not another base64 from fallback)
            if (publicUrl.startsWith('data:')) {
                return null // Upload failed, got fallback
            }
            return publicUrl
        } catch (e) {
            console.error('Migration failed for resource:', resource.id, e)
            return null
        }
    }

    const runMigration = async () => {
        setMigrating(true)
        setLog([])
        const newStats = { found: 0, migrated: 0, failed: 0, skipped: 0 }

        addLog('Starting migration scan...')

        for (const intent of intents) {
            let hasChanges = false
            const updates: Record<string, any> = {}

            // 1. Migrate intent.resources
            if (intent.resources?.length) {
                const migratedResources: MeetingResource[] = []
                for (const r of intent.resources) {
                    if (isBase64Url(r.url)) {
                        newStats.found++
                        addLog(`Found base64 resource: "${r.title}" in "${intent.objective}"`)
                        const newUrl = await migrateResource(r)
                        if (newUrl) {
                            migratedResources.push({ ...r, url: newUrl })
                            newStats.migrated++
                            addLog(`  ✅ Migrated → ${newUrl.substring(0, 80)}...`)
                        } else {
                            migratedResources.push(r) // Keep original
                            newStats.failed++
                            addLog(`  ❌ Failed to migrate`)
                        }
                    } else {
                        migratedResources.push(r)
                        if (r.url) newStats.skipped++
                    }
                }
                if (migratedResources.some((r, i) => r.url !== intent.resources![i].url)) {
                    updates.resources = migratedResources
                    hasChanges = true
                }
            }

            // 2. Migrate intent.questions[].attachments
            if (intent.questions?.length) {
                const migratedQuestions = []
                for (const q of intent.questions) {
                    if (q.attachments?.length) {
                        const migratedAttachments: MeetingResource[] = []
                        for (const a of q.attachments) {
                            if (isBase64Url(a.url)) {
                                newStats.found++
                                addLog(`Found base64 attachment: "${a.title}" in question "${q.text?.substring(0, 30)}..."`)
                                const newUrl = await migrateResource(a)
                                if (newUrl) {
                                    migratedAttachments.push({ ...a, url: newUrl })
                                    newStats.migrated++
                                    addLog(`  ✅ Migrated`)
                                } else {
                                    migratedAttachments.push(a)
                                    newStats.failed++
                                    addLog(`  ❌ Failed`)
                                }
                            } else {
                                migratedAttachments.push(a)
                            }
                        }
                        migratedQuestions.push({ ...q, attachments: migratedAttachments })
                    } else {
                        migratedQuestions.push(q)
                    }
                }
                if (JSON.stringify(migratedQuestions) !== JSON.stringify(intent.questions)) {
                    updates.questions = migratedQuestions
                    hasChanges = true
                }
            }

            // 3. Migrate intent.meetingNotes[].attachments
            if (intent.meetingNotes?.length) {
                const migratedNotes = []
                for (const n of intent.meetingNotes) {
                    if (n.attachments?.length) {
                        const migratedAttachments: MeetingResource[] = []
                        for (const a of n.attachments) {
                            if (isBase64Url(a.url)) {
                                newStats.found++
                                addLog(`Found base64 attachment: "${a.title}" in note "${n.text?.substring(0, 30)}..."`)
                                const newUrl = await migrateResource(a)
                                if (newUrl) {
                                    migratedAttachments.push({ ...a, url: newUrl })
                                    newStats.migrated++
                                    addLog(`  ✅ Migrated`)
                                } else {
                                    migratedAttachments.push(a)
                                    newStats.failed++
                                    addLog(`  ❌ Failed`)
                                }
                            } else {
                                migratedAttachments.push(a)
                            }
                        }
                        migratedNotes.push({ ...n, attachments: migratedAttachments })
                    } else {
                        migratedNotes.push(n)
                    }
                }
                if (JSON.stringify(migratedNotes) !== JSON.stringify(intent.meetingNotes)) {
                    updates.meetingNotes = migratedNotes
                    hasChanges = true
                }
            }

            // Apply updates
            if (hasChanges) {
                updateIntent(intent.id, updates)
                addLog(`💾 Saved updates for "${intent.objective}"`)
            }
        }

        setStats(newStats)
        addLog(`\n--- Migration Complete ---`)
        addLog(`Found: ${newStats.found} | Migrated: ${newStats.migrated} | Failed: ${newStats.failed} | Skipped (already URLs): ${newStats.skipped}`)
        setMigrating(false)
    }

    const base64Count = intents.reduce((count, intent) => {
        const rCount = intent.resources?.filter(r => isBase64Url(r.url)).length || 0
        const qCount = intent.questions?.reduce((qc, q) =>
            qc + (q.attachments?.filter(a => isBase64Url(a.url)).length || 0), 0) || 0
        const nCount = intent.meetingNotes?.reduce((nc, n) =>
            nc + (n.attachments?.filter(a => isBase64Url(a.url)).length || 0), 0) || 0
        return count + rCount + qCount + nCount
    }, 0)

    return (
        <div className="p-4 border rounded-lg space-y-4 bg-card">
            <div>
                <h3 className="font-semibold text-lg">📦 Base64 → Storage Migration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Moves existing base64-encoded file attachments to Supabase Storage to reduce state size and egress.
                </p>
            </div>

            <div className="text-sm">
                <span className="font-medium">Base64 attachments found:</span>{' '}
                <span className={base64Count > 0 ? 'text-orange-500 font-bold' : 'text-green-500'}>
                    {base64Count}
                </span>
                {base64Count === 0 && <span className="ml-2">✅ Nothing to migrate!</span>}
            </div>

            {base64Count > 0 && (
                <Button
                    onClick={runMigration}
                    disabled={migrating}
                    variant={migrating ? 'outline' : 'default'}
                >
                    {migrating ? '⏳ Migrating...' : `🚀 Migrate ${base64Count} attachment${base64Count > 1 ? 's' : ''}`}
                </Button>
            )}

            {stats.migrated > 0 && (
                <div className="text-sm p-2 bg-green-500/10 border border-green-500/20 rounded">
                    ✅ Migrated {stats.migrated} attachment{stats.migrated > 1 ? 's' : ''} to Supabase Storage
                    {stats.failed > 0 && <span className="text-red-400 ml-2">({stats.failed} failed)</span>}
                </div>
            )}

            {log.length > 0 && (
                <div className="max-h-60 overflow-y-auto bg-muted/30 rounded p-3 text-xs font-mono space-y-0.5">
                    {log.map((line, i) => (
                        <div key={i} className={line.includes('✅') ? 'text-green-400' : line.includes('❌') ? 'text-red-400' : 'text-muted-foreground'}>
                            {line}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
