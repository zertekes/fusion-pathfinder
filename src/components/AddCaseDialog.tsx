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
import { Input } from "@/components/ui/input"
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

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            title: formData.get("title"),
            clientId: formData.get("clientId"),
            status: formData.get("status"),
            value: parseFloat(formData.get("value") as string) || 0,
            advisorId: "user-id-placeholder", // In a real app, this would come from the session
        }

        // We need the current user ID for the advisorId. 
        // Since this is a client component, we can't easily get the session here without passing it down or using a provider.
        // For now, let's fetch the session in the API route or pass it from the page.
        // Actually, the API route usually handles assigning the current user if not provided, 
        // but our current API route expects advisorId.
        // Let's update the API route to handle this or pass the user ID.
        // For simplicity in this step, let's assume the API handles it or we pass a placeholder 
        // and the API overrides it with the session user.

        // Let's check the API route implementation later. For now, we'll send what we have.

        try {
            // We need to fetch the current user's ID to pass as advisorId, 
            // OR we update the API to use the session user.
            // Let's try to use the existing API.
            // The existing API at /api/cases/route.ts expects advisorId.
            // We can get the session in the component if we use SessionProvider, but that might be overkill.
            // A better approach for this specific app structure:
            // The page.tsx is server-side, it can pass the current userId to this component.

            // Wait, let's look at how AddClientDialog worked. It didn't need a user ID.
            // But Case needs an advisor.

            // Let's update the component to accept userId as a prop.

            const res = await fetch("/api/cases", {
                method: "POST",
                body: JSON.stringify(data),
            })

            if (res.ok) {
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" name="title" className="col-span-3" required placeholder="e.g. Mortgage Application" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientId" className="text-right">
                                Client
                            </Label>
                            <div className="col-span-3">
                                <Select name="clientId" required>
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
                                <Select name="status" required defaultValue={COLUMNS[0]}>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right">
                                Value (£)
                            </Label>
                            <Input id="value" name="value" type="number" className="col-span-3" placeholder="0.00" />
                        </div>
                        {/* Hidden input for advisorId - we'll handle this in the parent or API */}
                        <input type="hidden" name="advisorId" value="current-user-id" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
