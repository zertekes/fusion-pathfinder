"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Case, Client, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { COLUMNS } from "./TaskFlowBoard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

interface CaseDetailsContentProps {
    caseItem: CaseWithRelations
    onClose?: () => void
    onDeleteSuccess?: () => void
    onDirtyChange?: (isDirty: boolean) => void
}

export function CaseDetailsContent({ caseItem, onClose, onDeleteSuccess, onDirtyChange }: CaseDetailsContentProps) {
    const router = useRouter()
    const [isDeleteMode, setIsDeleteMode] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [showCancelAlert, setShowCancelAlert] = useState(false)

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editData, setEditData] = useState<{
        title: string
        status: string
        value: number
        brokerName: string
        taskOwnerName: string
        deadline?: Date | null
    }>({
        title: "",
        status: "",
        value: 0,
        brokerName: "",
        taskOwnerName: "",
        deadline: null
    })

    // Track dirty state
    useEffect(() => {
        if (!isEditMode) {
            onDirtyChange?.(false)
            return
        }

        const isDirty =
            editData.title !== caseItem.title ||
            editData.status !== caseItem.status ||
            editData.value !== (caseItem.value || 0) ||
            editData.brokerName !== (caseItem.brokerName || "") ||
            editData.taskOwnerName !== (caseItem.taskOwnerName || "") ||
            (editData.deadline?.getTime() !== (caseItem.deadline ? new Date(caseItem.deadline).getTime() : undefined))

        onDirtyChange?.(isDirty)

        // Browser navigation protection
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [isEditMode, editData, caseItem, onDirtyChange])

    // Activity State
    const [activities, setActivities] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [isPostingComment, setIsPostingComment] = useState(false)

    useEffect(() => {
        if (caseItem?.id) {
            fetchActivities()
        }
    }, [caseItem?.id])

    // Initialize edit data when switching to edit mode
    useEffect(() => {
        if (isEditMode) {
            setEditData({
                title: caseItem.title,
                status: caseItem.status,
                value: caseItem.value || 0,
                brokerName: caseItem.brokerName || "",
                taskOwnerName: caseItem.taskOwnerName || "",
                deadline: caseItem.deadline ? new Date(caseItem.deadline) : null
            })
        }
    }, [isEditMode, caseItem])

    const fetchActivities = async () => {
        if (!caseItem?.id) return
        try {
            const res = await fetch(`/api/cases/${caseItem.id}`)
            if (res.ok) {
                const data = await res.json()
                if (data.activities) {
                    setActivities(data.activities)
                }
            }
        } catch (error) {
            console.error("Failed to fetch activities", error)
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim() || !caseItem?.id) return

        setIsPostingComment(true)
        try {
            const res = await fetch(`/api/cases/${caseItem.id}/comments`, {
                method: "POST",
                body: JSON.stringify({ content: newComment }),
            })

            if (res.ok) {
                setNewComment("")
                fetchActivities()
            } else {
                toast.error("Failed to post comment")
            }
        } catch (error) {
            console.error("Failed to add comment", error)
            toast.error("Error posting comment")
        } finally {
            setIsPostingComment(false)
        }
    }

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
                toast.error("Failed to update case")
            }
        } catch (error) {
            console.error("Error updating case:", error)
            toast.error("Error updating case")
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
                if (onDeleteSuccess) onDeleteSuccess()
                router.refresh()
            } else {
                console.error("Failed to delete case")
                toast.error("Failed to delete case")
            }
        } catch (error) {
            console.error("Error deleting case:", error)
            toast.error("Error deleting case")
        } finally {
            setIsDeleting(false)
            setIsDeleteMode(false)
            setDeleteConfirmation("")
        }
    }

    const handleDiscard = () => {
        setIsEditMode(false)
        setShowCancelAlert(false)
        // Reset data
        setEditData({
            title: caseItem.title,
            status: caseItem.status,
            value: caseItem.value || 0,
            brokerName: caseItem.brokerName || "",
            taskOwnerName: caseItem.taskOwnerName || "",
            deadline: caseItem.deadline ? new Date(caseItem.deadline) : null
        })
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full">
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                <div className="grid gap-4 py-4">
                    {/* Existing Details Fields */}
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
                        <span className="font-bold text-right">Broker:</span>
                        {isEditMode ? (
                            <Input
                                value={editData.brokerName}
                                onChange={(e) => setEditData({ ...editData, brokerName: e.target.value })}
                                className="col-span-3"
                                placeholder="Broker Name"
                            />
                        ) : (
                            <span className="col-span-3">{caseItem.brokerName || "N/A"}</span>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Task Owner:</span>
                        {isEditMode ? (
                            <Input
                                value={editData.taskOwnerName}
                                onChange={(e) => setEditData({ ...editData, taskOwnerName: e.target.value })}
                                className="col-span-3"
                                placeholder="Task Owner Name"
                            />
                        ) : (
                            <span className="col-span-3">{caseItem.taskOwnerName || "N/A"}</span>
                        )}
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Deadline:</span>
                        {isEditMode ? (
                            <div className="col-span-3">
                                <DatePicker
                                    date={editData.deadline ? new Date(editData.deadline) : undefined}
                                    setDate={(date) => setEditData({ ...editData, deadline: date })}
                                />
                            </div>
                        ) : (
                            <span className="col-span-3">
                                {caseItem.deadline ? format(new Date(caseItem.deadline), "PPP") : "No deadline"}
                            </span>
                        )}
                    </div>

                    {/* History & Comments Section */}
                    <div className="mt-6 border-t pt-4">
                        <Tabs defaultValue="comments" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="comments">Comments</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="comments" className="space-y-4">
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleAddComment()
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isPostingComment}
                                    >
                                        {isPostingComment ? "Posting..." : "Post"}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {activities.filter(a => a.type === 'COMMENT').map((activity) => (
                                        <div key={activity.id} className="flex gap-3 text-sm">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">
                                                        {activity.user?.name || "System"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(activity.createdAt), "PP p")}
                                                    </span>
                                                </div>
                                                <p>{activity.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {activities.filter(a => a.type === 'COMMENT').length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No comments yet.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                {activities.filter(a => a.type === 'SYSTEM').map((activity) => (
                                    <div key={activity.id} className="flex gap-3 text-sm">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-muted-foreground">
                                                    System
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(activity.createdAt), "PP p")}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground italic">
                                                {activity.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {activities.filter(a => a.type === 'SYSTEM').length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No history yet.
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </ScrollArea>

            <div className="flex-col sm:flex-col gap-2 sm:space-x-0 mt-auto pt-4 border-t">
                {!isDeleteMode ? (
                    <div className="flex gap-2 justify-end w-full">
                        {isEditMode ? (
                            <>
                                <Button variant="ghost" onClick={() => {
                                    const isDirty =
                                        editData.title !== caseItem.title ||
                                        editData.status !== caseItem.status ||
                                        editData.value !== (caseItem.value || 0) ||
                                        editData.brokerName !== (caseItem.brokerName || "") ||
                                        editData.taskOwnerName !== (caseItem.taskOwnerName || "") ||
                                        (editData.deadline?.getTime() !== (caseItem.deadline ? new Date(caseItem.deadline).getTime() : undefined))

                                    if (isDirty) {
                                        setShowCancelAlert(true)
                                    } else {
                                        setIsEditMode(false)
                                    }
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditMode(true)}>
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
            </div>

            <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDiscard}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
