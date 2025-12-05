"use client"

import { useState, useEffect } from "react"
import { Client } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ClientEditDialogProps {
    client: Client
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: () => void
}

export function ClientEditDialog({ client, open, onOpenChange, onSave }: ClientEditDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: client.name || "",
        name2: client.name2 || "",
        name3: client.name3 || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
    })

    // Track dirty state
    const isDirty =
        formData.name !== (client.name || "") ||
        formData.name2 !== (client.name2 || "") ||
        formData.name3 !== (client.name3 || "") ||
        formData.email !== (client.email || "") ||
        formData.phone !== (client.phone || "") ||
        formData.address !== (client.address || "") ||
        formData.notes !== (client.notes || "")

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && isDirty) {
            if (!confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                return
            }
            // Reset form data on close if dirty
            setFormData({
                name: client.name || "",
                name2: client.name2 || "",
                name3: client.name3 || "",
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
                notes: client.notes || "",
            })
        }
        onOpenChange(newOpen)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to update client")
            }

            onSave()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Failed to update client")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px]"
                onPointerDownOutside={(e) => {
                    if (isDirty) {
                        e.preventDefault()
                    }
                }}
                onInteractOutside={(e) => {
                    if (isDirty) {
                        e.preventDefault()
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Make changes to the client profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name 1
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name2" className="text-right">
                            Name 2
                        </Label>
                        <Input
                            id="name2"
                            name="name2"
                            value={formData.name2}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name3" className="text-right">
                            Name 3
                        </Label>
                        <Input
                            id="name3"
                            name="name3"
                            value={formData.name3}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Phone
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                            Address
                        </Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
