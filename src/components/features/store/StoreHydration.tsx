"use client"

import { useEffect } from "react"
import { rehydrateStore } from "@/lib/store/calendar-store"

export function StoreHydration() {
    useEffect(() => {
        rehydrateStore()
    }, [])

    return null
}
