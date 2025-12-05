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

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

import { cn } from "@/lib/utils"

interface CaseDetailsSheetProps {
    caseItem: CaseWithRelations | null
    open: boolean
    onOpenChange: (open: boolean) => void
    fullScreen?: boolean
}

import { CaseDetailsContent } from "./CaseDetailsContent"

export function CaseDetailsSheet({ caseItem, open, onOpenChange, fullScreen = false }: CaseDetailsSheetProps) {
    const [isDirty, setIsDirty] = useState(false)
    const [showExitAlert, setShowExitAlert] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && isDirty) {
            setShowExitAlert(true)
            return
        }
        onOpenChange(newOpen)
    }

    if (!caseItem) return null

    return (
        <>
            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent
                    className={cn(
                        "flex flex-col h-full",
                        fullScreen ? "w-full sm:max-w-none" : "w-[400px] sm:w-[540px]"
                    )}
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

            <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setShowExitAlert(false)
                            onOpenChange(false)
                        }}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
