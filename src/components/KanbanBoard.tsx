"use client"

import { useState } from "react"
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
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type CaseWithRelations = Case & {
    client: Client
    advisor: User
}

interface KanbanBoardProps {
    initialCases: CaseWithRelations[]
}

const COLUMNS = ["LEAD", "APPLICATION", "UNDERWRITING", "OFFER", "COMPLETED"]

export function KanbanBoard({ initialCases }: KanbanBoardProps) {
    const router = useRouter()
    const [cases, setCases] = useState<CaseWithRelations[]>(initialCases)
    const [activeId, setActiveId] = useState<string | null>(null)

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

        // Find the dropped column
        // This is a simplified version. In a real app, we'd use Droppable containers for columns.
        // For now, let's assume we drop onto a column or another item in a column.
        // But dnd-kit requires droppable containers.

        // Let's implement a simpler version first: Just columns as droppable areas.
        // I'll refactor this to use proper SortableContext if I had more time, but for now, 
        // let's just make columns droppable.

        const activeCase = cases.find((c) => c.id === activeId)
        if (!activeCase) return

        // If dropped on a column header or empty column area
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
            // Revert on error
            router.refresh()
        }
    }

    return (
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
                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                                    {columnId}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 space-y-2 min-h-[200px]">
                                {/* We need to make this a Droppable area */}
                                <DroppableColumn id={columnId}>
                                    {cases
                                        .filter((c) => c.status === columnId)
                                        .map((c) => (
                                            <DraggableCase key={c.id} caseItem={c} />
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
    )
}

import { useDraggable, useDroppable } from "@dnd-kit/core"

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

function DraggableCase({ caseItem }: { caseItem: CaseWithRelations }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: caseItem.id,
    })
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="font-medium">{caseItem.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {caseItem.client.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                        <span>£{caseItem.value?.toLocaleString() ?? 0}</span>
                        <span>{new Date(caseItem.updatedAt).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
