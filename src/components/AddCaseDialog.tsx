"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { Client } from "@prisma/client"
import { COLUMNS } from "@/components/TaskFlowBoard"

interface AddCaseDialogProps {
    clients: Client[]
}

export function AddCaseDialog({ clients }: AddCaseDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>(COLUMNS[0])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const client = clients.find(c => c.id === selectedClientId)
        const title = client ? client.name : "New Case"

        const data = {
            title: title,
            clientId: selectedClientId,
            status: selectedStatus,
            value: 0,
            advisorId: "user-id-placeholder",
        }

        try {
            const res = await fetch("/api/cases", {
                method: "POST",
                body: JSON.stringify(data),
            })

            if (res.ok) {
                setOpen(false)
                router.refresh()
                // Reset form
                setSelectedClientId("")
                setSelectedStatus(COLUMNS[0])
            } else {
                const errorData = await res.json()
                console.error("Failed to create case:", errorData)
                alert(`Failed to create case: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("An error occurred. Check console.")
        } finally {
            setLoading(false)
        }
    }

    const isValid = selectedClientId !== "" && selectedStatus !== ""

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Client Card</DialogTitle>
                        <DialogDescription>
                            Create a new card for the task flow.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientId" className="text-right">
                                Client
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    name="clientId"
                                    required
                                    value={selectedClientId}
                                    onValueChange={setSelectedClientId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    name="status"
                                    required
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLUMNS.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Hidden input for advisorId - we'll handle this in the parent or API */}
                        <input type="hidden" name="advisorId" value="current-user-id" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !isValid}>
                            {loading ? "Creating..." : "Create Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
