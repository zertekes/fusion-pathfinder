"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface EditUserDialogProps {
    user: {
        id: string
        name: string | null
        email: string | null
        role: string
        status: string
    } | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUserUpdated: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState(user?.role || "ADVISOR")
    const [status, setStatus] = useState(user?.status || "Active")

    // Update local state when user prop changes
    if (user && (user.role !== role || user.status !== status) && !loading && !open) {
        setRole(user.role)
        setStatus(user.status)
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!user) return

        setLoading(true)

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role, status }),
            })

            if (res.ok) {
                toast.success("User updated successfully!")
                onUserUpdated()
                onOpenChange(false)
            } else {
                const errorData = await res.json()
                toast.error(`Failed to update user: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Failed to update user:", error)
            toast.error("An error occurred. Check console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user role and status.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <div className="col-span-3 text-sm font-medium">
                                {user?.name || "N/A"}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Email</Label>
                            <div className="col-span-3 text-sm text-muted-foreground">
                                {user?.email}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADVISOR">Advisor</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
