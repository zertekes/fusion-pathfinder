"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export function MigrationCard() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/migration/google", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            if (res.ok) {
                setResult(`Successfully imported ${data.count} clients.`)
                router.refresh()
            } else {
                setResult(`Error: ${data.error}`)
            }
        } catch (error) {
            setResult("Upload failed.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import from Google Calendar</CardTitle>
                <CardDescription>
                    Upload an .ics file exported from Google Calendar to import your client database.
                    Events will be converted into Client records.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                            type="file"
                            accept=".ics"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    <Button type="submit" disabled={!file || loading}>
                        {loading ? (
                            <>Importing...</>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" /> Import Data
                            </>
                        )}
                    </Button>
                    {result && (
                        <div className="p-4 bg-muted rounded-md text-sm">
                            {result}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
