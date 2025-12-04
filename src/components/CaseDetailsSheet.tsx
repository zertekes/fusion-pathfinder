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
    if (!caseItem) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>{caseItem.client.name}</SheetTitle>
                    <SheetDescription>
                        Case Details - {caseItem.caseNumber}
                    </SheetDescription>
                </SheetHeader>

                <CaseDetailsContent
                    caseItem={caseItem}
                    onClose={() => onOpenChange(false)}
                    onDeleteSuccess={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    )
}
