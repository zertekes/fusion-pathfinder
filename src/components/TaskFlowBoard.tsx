"use client"

import { useState, useEffect } from "react"
import { CaseDetailsSheet } from "@/components/CaseDetailsSheet"
import { CaseDetailsDialog } from "@/components/CaseDetailsDialog"
import { Case, Client, User } from "@prisma/client"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDraggable, useDroppable } from "@dnd-kit/core"

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

interface TaskFlowBoardProps {
    initialCases: CaseWithRelations[]
}

export const COLUMNS = [
    "Contact",
    "Pre-IC",
    "Doc collection",
    "Analysis",
    "ID call",
    "DIP",
    "Property search",
    "Property found",
    "FMA prep",
    "FMA",
    "Valuation",
    "Bank underwriter process",
    "Offer",
    "SL doc",
    "Rate Change",
    "Exchange",
    "Completion",
    "REMO"
]

// Task Flow Components Checklist:
// - [ ] Create Task Flow Components <!-- id: 21 -->
//     - [x] Create TaskFlowBoard.tsx <!-- id: 22 -->
//     - [ ] Create src/app/(dashboard)/task-flow/page.tsx <!-- id: 23 -->

export function TaskFlowBoard({ initialCases }: TaskFlowBoardProps) {
    const router = useRouter()
    const [cases, setCases] = useState<CaseWithRelations[]>(initialCases)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [selectedCase, setSelectedCase] = useState<CaseWithRelations | null>(null)

    // Sync state with props when initialCases changes (e.g. after router.refresh)
    useEffect(() => {
        setCases(initialCases)
    }, [initialCases])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeCase = cases.find((c) => c.id === activeId)
        if (!activeCase) return

        if (COLUMNS.includes(overId)) {
            if (activeCase.status !== overId) {
                updateCaseStatus(activeId, overId)
            }
        }

        setActiveId(null)
    }

    async function updateCaseStatus(caseId: string, newStatus: string) {
        // Optimistic update
        setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c))

        try {
            await fetch(`/api/cases/${caseId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update status", error)
            router.refresh()
        }
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((columnId) => (
                        <div key={columnId} className="w-80 flex-shrink-0">
                            <Card className="h-full bg-muted/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground whitespace-nowrap">
                                        {columnId}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 space-y-2 min-h-[200px]">
                                    <DroppableColumn id={columnId}>
                                        {cases
                                            .filter((c) => c.status === columnId)
                                            .map((c) => (
                                                <DraggableCase
                                                    key={c.id}
                                                    caseItem={c}
                                                    onClick={(e, type) => {
                                                        if (type === 'card') {
                                                            // Optional: open full dialog on card click if needed, 
                                                            // or just do nothing if only number click is desired.
                                                            // For now, let's keep it consistent: card click -> full dialog? 
                                                            // User asked for "click on it open the ticket details on the right side".
                                                            // Let's make card click open the sheet too for better UX, or maybe the dialog?
                                                            // The user said "when the user clicks on it [the number] open the ticket details".
                                                            // Let's stick to the sheet for now for both.
                                                            setSelectedCase(c)
                                                        } else if (type === 'number') {
                                                            setSelectedCase(c)
                                                        }
                                                    }}
                                                />
                                            ))}
                                    </DroppableColumn>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? (
                        <div className="p-4 bg-background border rounded shadow">
                            Dragging...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
            <CaseDetailsSheet
                caseItem={selectedCase}
                open={!!selectedCase}
                onOpenChange={(open) => !open && setSelectedCase(null)}
            />
        </>
    )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[100px]">
            {children}
        </div>
    )
}

function DraggableCase({ caseItem, onClick }: { caseItem: CaseWithRelations, onClick: (e: React.MouseEvent, type: 'card' | 'number') => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: caseItem.id,
    })
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                onClick={(e) => onClick(e, 'card')}
            >
                <CardContent className="p-4">
                    <div className="font-medium text-center">
                        {caseItem.caseNumber && (
                            <span
                                className="mr-2 text-purple-600 text-sm font-bold cursor-pointer hover:underline"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation() // Prevent card click
                                    onClick(e, 'number')
                                }}
                            >
                                {caseItem.caseNumber}
                            </span>
                        )}
                        {caseItem.client.name}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
