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
import { Flag } from "lucide-react"

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
        // Optimistic update: clear deadline when moving
        setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus, deadline: null } : c))

        try {
            await fetch(`/api/cases/${caseId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus, deadline: null })
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
                                            .sort((a, b) => {
                                                // Sort overdue cases to the top
                                                const getDeadlineTime = (c: CaseWithRelations) => {
                                                    if (!c.deadline) return Infinity // No deadline -> bottom
                                                    const d = new Date(c.deadline)
                                                    const deadlineDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                                                    const today = new Date()
                                                    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                                                    return deadlineDate.getTime() - todayDate.getTime()
                                                }

                                                const timeA = getDeadlineTime(a)
                                                const timeB = getDeadlineTime(b)

                                                // If both are overdue (time < 0), sort by most overdue first? Or just keep them at top?
                                                // User said "keep the card on the very top".
                                                // Let's sort by deadline ascending (so most overdue is first, then today, then tomorrow...)
                                                // But we only want to prioritize overdue.

                                                const isOverdueA = timeA < 0
                                                const isOverdueB = timeB < 0

                                                if (isOverdueA && !isOverdueB) return -1
                                                if (!isOverdueA && isOverdueB) return 1

                                                // If both overdue or both not overdue, sort by deadline?
                                                // Or maybe just by creation date if not overdue?
                                                // Let's sort by deadline generally as it makes sense for a task board.
                                                if (timeA !== timeB) return timeA - timeB

                                                return 0
                                            })
                                            .map((c) => (
                                                <DraggableCase
                                                    key={c.id}
                                                    caseItem={c}
                                                    onClick={(e, type) => {
                                                        if (type === 'card') {
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

    const getDeadlineColor = (deadline: Date | null) => {
        if (!deadline) return null

        const today = new Date()
        // Reset today to local midnight
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const d = new Date(deadline)
        // Treat the stored UTC deadline as the intended local date
        const deadlineDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

        // Calculate raw time difference for overdue check
        const diffTime = deadlineDate.getTime() - todayDate.getTime()

        if (diffTime < 0) return "text-black" // Overdue (Yesterday or earlier)
        if (diffTime === 0) return "text-red-600" // Today

        // Count working days (Mon-Fri)
        let workingDays = 0
        let currentDate = new Date(todayDate)
        currentDate.setDate(currentDate.getDate() + 1) // Start counting from tomorrow

        while (currentDate <= deadlineDate) {
            const day = currentDate.getDay()
            if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
                workingDays++
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }

        if (workingDays === 1) return "text-orange-500" // Next working day
        if (workingDays === 2) return "text-yellow-300" // 2 working days
        if (workingDays === 3) return "text-blue-500" // 3 working days

        return null
    }

    const flagColor = getDeadlineColor(caseItem.deadline ? new Date(caseItem.deadline) : null)

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative"
                onClick={(e) => onClick(e, 'card')}
            >
                <CardContent className="p-4">
                    {flagColor && (
                        <div className={`absolute top-2 right-2 ${flagColor}`}>
                            <Flag className="h-4 w-4 fill-current" />
                        </div>
                    )}
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
                        {caseItem.client.name2 && `, ${caseItem.client.name2}`}
                        {caseItem.client.name3 && `, ${caseItem.client.name3}`}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
