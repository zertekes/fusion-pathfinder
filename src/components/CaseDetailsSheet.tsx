"use client"

import { Case, Client, User } from "@prisma/client"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
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

export function CaseDetailsSheet({ caseItem, open, onOpenChange }: CaseDetailsSheetProps) {
    if (!caseItem) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{caseItem.client.name}</SheetTitle>
                    <SheetDescription>
                        Case Details - {caseItem.caseNumber}
                    </SheetDescription>
                </SheetHeader>
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
                    {/* Add more details here as needed */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Phone:</span>
                        <span className="col-span-3">{caseItem.client.phone || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right">Email:</span>
                        <span className="col-span-3">{caseItem.client.email || "N/A"}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
