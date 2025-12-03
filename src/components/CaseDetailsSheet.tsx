"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Case, Client, User } from "@prisma/client"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

interface CaseDetailsSheetProps {
    caseItem: CaseWithRelations | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

import { COLUMNS } from "./TaskFlowBoard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CaseDetailsSheet({ caseItem, open, onOpenChange }: CaseDetailsSheetProps) {
    const router = useRouter()
    const [isDeleteMode, setIsDeleteMode] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editData, setEditData] = useState({
        title: "",
        status: "",
        value: 0
    })

    // Initialize edit data when opening or switching to edit mode
    if (caseItem && open && !isEditMode && (editData.title !== caseItem.title)) {
        setEditData({
            title: caseItem.title,
            status: caseItem.status,
            value: caseItem.value || 0
        })
    }

    if (!caseItem) return null

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/cases/${caseItem.id}`, {
                method: "PATCH",
                body: JSON.stringify(editData),
            })

            if (res.ok) {
                setIsEditMode(false)
                router.refresh()
            } else {
                console.error("Failed to update case")
                alert("Failed to update case")
            }
        } catch (error) {
            console.error("Error updating case:", error)
            alert("Error updating case")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (deleteConfirmation !== "DELETE") return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/cases/${caseItem.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                onOpenChange(false)
                router.refresh()
            } else {
                console.error("Failed to delete case")
                alert("Failed to delete case")
            }
        } catch (error) {
            console.error("Error deleting case:", error)
            alert("Error deleting case")
        } finally {
            setIsDeleting(false)
            setIsDeleteMode(false)
            setDeleteConfirmation("")
        }
    }

    return (
        <Sheet open={open} onOpenChange={(val) => {
            if (!val) {
                setIsDeleteMode(false)
                setDeleteConfirmation("")
                setIsEditMode(false)
            }
            onOpenChange(val)
        }}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>{caseItem.client.name}</SheetTitle>
                    <SheetDescription>
                        Case Details - {caseItem.caseNumber}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Title:</span>
                            {isEditMode ? (
                                <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="col-span-3"
                                />
                            ) : (
                                <span className="col-span-3">{caseItem.title}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Status:</span>
                            {isEditMode ? (
                                <div className="col-span-3">
                                    <Select
                                        value={editData.status}
                                        onValueChange={(val) => setEditData({ ...editData, status: val })}
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
                            ) : (
                                <span className="col-span-3">{caseItem.status}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Value:</span>
                            {isEditMode ? (
                                <Input
                                    type="number"
                                    value={editData.value}
                                    onChange={(e) => setEditData({ ...editData, value: parseFloat(e.target.value) || 0 })}
                                    className="col-span-3"
                                />
                            ) : (
                                <span className="col-span-3">£{caseItem.value?.toLocaleString() ?? 0}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Advisor:</span>
                            <span className="col-span-3">{caseItem.advisor?.name ?? "Unassigned"}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Updated:</span>
                            <span className="col-span-3">{format(new Date(caseItem.updatedAt), "PPP")}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Phone:</span>
                            <span className="col-span-3">{caseItem.client.phone || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Email:</span>
                            <span className="col-span-3">{caseItem.client.email || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Address:</span>
                            <span className="col-span-3">{caseItem.client.address || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Notes:</span>
                            <span className="col-span-3 whitespace-pre-wrap">{caseItem.client.notes || "N/A"}</span>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
                    {!isDeleteMode ? (
                        <div className="flex gap-2 justify-end w-full">
                            {isEditMode ? (
                                <>
                                    <Button variant="ghost" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => {
                                        setEditData({
                                            title: caseItem.title,
                                            status: caseItem.status,
                                            value: caseItem.value || 0
                                        })
                                        setIsEditMode(true)
                                    }}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" onClick={() => setIsDeleteMode(true)}>
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 w-full border rounded-md p-4 bg-destructive/10">
                            <div className="space-y-2">
                                <h4 className="font-medium text-destructive">Delete Case?</h4>
                                <p className="text-sm text-muted-foreground">
                                    You are going to delete this card from the board. Please type <strong>DELETE</strong> to confirm it.
                                </p>
                            </div>
                            <Input
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="bg-background"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => {
                                    setIsDeleteMode(false)
                                    setDeleteConfirmation("")
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={deleteConfirmation !== "DELETE" || isDeleting}
                                    onClick={handleDelete}
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
