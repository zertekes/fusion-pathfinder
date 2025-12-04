"use client"

import { useState, useEffect } from "react"
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

import { CaseDetailsContent } from "./CaseDetailsContent"

export function CaseDetailsSheet({ caseItem, open, onOpenChange }: CaseDetailsSheetProps) {
    const [isDirty, setIsDirty] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && isDirty) {
            if (!confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                return
            }
        }
        onOpenChange(newOpen)
    }

    if (!caseItem) return null

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                className="w-[400px] sm:w-[540px] flex flex-col h-full"
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
                <SheetHeader>
                    <SheetTitle>{caseItem.client.name}</SheetTitle>
                    <SheetDescription>
                        Case Details - {caseItem.caseNumber}
                    </SheetDescription>
                </SheetHeader>

                <CaseDetailsContent
                    caseItem={caseItem}
                    onClose={() => handleOpenChange(false)}
                    onDeleteSuccess={() => {
                        setIsDirty(false)
                        onOpenChange(false)
                    }}
                    onDirtyChange={setIsDirty}
                />
            </SheetContent>
        </Sheet>
    )
}
