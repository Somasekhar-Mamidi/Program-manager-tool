"use client"

import { Button } from "@/components/ui/button"
import { Download, RefreshCcw, Database } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { DataMigration } from "./DataMigration"

export function DataRecovery() {
    const [exists, setExists] = useState(false)
    const [size, setSize] = useState(0)
    const [showMigration, setShowMigration] = useState(false)

    useEffect(() => {
        const checkData = async () => {
            // Check Supabase
            try {
                const { data } = await supabase.from('app_storage').select('value').eq('key', 'msc-storage').single();
                if (data?.value) {
                    setExists(true);
                    setSize(JSON.stringify(data.value).length);
                    return;
                }
            } catch (e) {
                console.error("Supabase check failed", e);
            }

            // Fallback to LocalStorage
            const data = localStorage.getItem('msc-storage')
            if (data) {
                setExists(true)
                setSize(data.length)
            }
        }
        checkData()
        const interval = setInterval(checkData, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleBackup = async () => {
        let data: string | null = null;

        // Try Supabase
        try {
            const { data: record } = await supabase.from('app_storage').select('value').eq('key', 'msc-storage').single();
            if (record?.value) data = JSON.stringify(record.value);
        } catch (e) { }

        // Fallback
        if (!data) {
            data = localStorage.getItem('msc-storage')
        }

        if (!data) {
            toast.error("No data found")
            return
        }

        try {
            const blob = new Blob([data], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `calendar-backup-${new Date().toISOString()}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Backup downloaded successfully")
        } catch (e) {
            console.error(e)
            toast.error("Failed to create backup")
        }
    }

    const handleRestore = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsed = JSON.parse(content);

                    if (!parsed.state || !parsed.state.intents) {
                        if (!confirm("Invalid backup format. Restore anyway?")) return;
                    }

                    // RESTORE TO Supabase
                    const { error } = await supabase
                        .from('app_storage')
                        .upsert({ key: 'msc-storage', value: parsed }, { onConflict: 'key' });

                    if (!error) {
                        toast.success("Data restored to Supabase! Reloading...");
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        throw new Error("Supabase Save failed: " + error.message)
                    }

                } catch (err) {
                    toast.error("Restore failed: " + err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    if (!exists) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-background border p-4 rounded-lg shadow-xl max-w-sm">
            <div className="text-sm font-medium mb-1">Data: {(size / 1024).toFixed(2)} KB</div>
            <Button onClick={handleBackup} size="sm" variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Backup Data
            </Button>
            <Button onClick={handleRestore} size="sm" variant="outline" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restore JSON
            </Button>
            <Button onClick={() => setShowMigration(!showMigration)} size="sm" variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                {showMigration ? 'Hide Migration' : 'Migrate to Storage'}
            </Button>
            {showMigration && <DataMigration />}
        </div>
    )
}
