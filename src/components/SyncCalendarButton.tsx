"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function SyncCalendarButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSync() {
        setLoading(true)
        try {
            const res = await fetch("/api/calendar/sync", {
                method: "POST",
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error("Sync failed", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Outlook
        </Button>
    )
}
