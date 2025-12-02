"use client"

import { Case, Client, User } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

interface CaseDetailsDialogProps {
    caseItem: CaseWithRelations | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CaseDetailsDialog({ caseItem, open, onOpenChange }: CaseDetailsDialogProps) {
    if (!caseItem) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{caseItem.client.name}</DialogTitle>
                    <DialogDescription>
                        Case Details
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Title:</span>
                        <span className="col-span-3">{caseItem.title}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Status:</span>
                        <span className="col-span-3">{caseItem.status}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Value:</span>
                        <span className="col-span-3">£{caseItem.value?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Advisor:</span>
                        <span className="col-span-3">{caseItem.advisor?.name ?? "Unassigned"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Updated:</span>
                        <span className="col-span-3">{format(new Date(caseItem.updatedAt), "PPP")}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
